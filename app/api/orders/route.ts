import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { apiError, hasCrossOrigin, isString, readJson, reportApiError } from '@/lib/server/api'
import { getAdminFromRequest } from '@/lib/server/auth'
import { prisma } from '@/lib/server/prisma'
import { serializeOrder } from '@/lib/server/serializers'
import { sendMetaEvent } from '@/lib/server/meta-conversions'
import { absoluteUrl } from '@/lib/seo'

// Limite maximale du total d'une commande (en unité monétaire)
const MAX_ORDER_TOTAL = 99_999_999.99

function isValidPhone(value: string) {
  const trimmed = value.trim()
  const digits = trimmed.replace(/\D/g, '')
  return (
    /^[0-9\s+().-]{8,40}$/.test(trimmed) &&
    digits.length >= 8 &&
    digits.length <= 15
  )
}

/**
 * Arrondit un montant monétaire à 2 décimales pour éviter
 * les erreurs d'arrondi des flottants (ex: 0.1 + 0.2).
 */
function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export async function GET(request: NextRequest) {
  try {
    if (!(await getAdminFromRequest(request))) {
      return apiError('Authentification requise.', 401)
    }
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders.map(serializeOrder))
  } catch (error) {
    return reportApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (hasCrossOrigin(request)) {
      return apiError('Requête inter-origine refusée.', 403)
    }

    const body = await readJson(request)
    const customer = body?.customer as Record<string, unknown> | undefined
    const items = body?.items
    const fullName = customer?.fullName
    const phone1 = customer?.phone1
    const phone2 = customer?.phone2
    const address = customer?.address

    // Validation (on valide sur la version trim pour éviter les chaînes vides)
    const fullNameTrimmed = isString(fullName, 200) ? (fullName as string).trim() : ''
    const addressTrimmed = isString(address, 1000) ? (address as string).trim() : ''
    const phone1Trimmed = isString(phone1, 40) ? (phone1 as string).trim() : ''
    const phone2Trimmed =
      typeof phone2 === 'string' && phone2.trim().length > 0 ? phone2.trim() : null

    if (
      !customer ||
      !fullNameTrimmed ||
      !phone1Trimmed ||
      !(
        phone2 === undefined ||
        phone2 === null ||
        (typeof phone2 === 'string' && phone2.length <= 40)
      ) ||
      !isValidPhone(phone1Trimmed) ||
      (phone2Trimmed !== null && !isValidPhone(phone2Trimmed)) ||
      !addressTrimmed ||
      !Array.isArray(items) ||
      items.length < 1 ||
      items.length > 50
    ) {
      return apiError('Les informations de commande sont invalides.', 400)
    }

    // Validation des articles
    const requestedItems: Array<{ productId: string; quantity: number }> = []
    const ids = new Set<string>()

    for (const item of items) {
      if (!item || typeof item !== 'object') {
        return apiError('Les articles de la commande sont invalides.', 400)
      }

      const rawProductId = (item as Record<string, unknown>).productId
      const rawQuantity = (item as Record<string, unknown>).quantity

      if (
        !isString(rawProductId, 100) ||
        typeof rawQuantity !== 'number' ||
        !Number.isSafeInteger(rawQuantity) ||
        rawQuantity < 1 ||
        rawQuantity > 100
      ) {
        return apiError('Les articles de la commande sont invalides.', 400)
      }

      const productId = (rawProductId as string).trim()
      const quantity = rawQuantity as number

      if (!productId) {
        return apiError('Les articles de la commande sont invalides.', 400)
      }
      if (ids.has(productId)) {
        return apiError('Un article ne peut apparaître qu’une seule fois.', 400)
      }

      ids.add(productId)
      requestedItems.push({ productId, quantity })
    }

    // Lecture des données Meta (cookies / headers) — hors transaction
    const metaFbp = request.cookies.get('_fbp')?.value ?? null
    const metaFbc = request.cookies.get('_fbc')?.value ?? null
    const metaClientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null
    const metaUserAgent = request.headers.get('user-agent') ?? null
    const metaEventSourceUrl = request.headers.get('referer') ?? null

    // Générer l'ID de l'événement AVANT la transaction pour pouvoir
    // le réutiliser après (envoi Meta CAPI).
    const metaEventId = randomUUID()

    const order = await prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({
        where: {
          id: { in: requestedItems.map((item) => item.productId) },
          isActive: true,
        },
      })

      if (products.length !== requestedItems.length) {
        throw new Error('ORDER_PRODUCT_UNAVAILABLE')
      }

      const byId = new Map(products.map((product) => [product.id, product]))
      const orderItems = []
      let total = 0

      for (const requested of requestedItems) {
        const product = byId.get(requested.productId)

        if (!product) {
          throw new Error('ORDER_PRODUCT_UNAVAILABLE')
        }

        // Vérification du stock si le champ existe
        const stock = (product as { stock?: number | null }).stock
        if (typeof stock === 'number' && stock < requested.quantity) {
          throw new Error('ORDER_OUT_OF_STOCK')
        }

        const unitPrice =
          product.promoPrice != null &&
            Number(product.promoPrice) < Number(product.price)
            ? Number(product.promoPrice)
            : Number(product.price)

        total += unitPrice * requested.quantity

        if (total > MAX_ORDER_TOTAL) {
          throw new Error('ORDER_TOTAL_LIMIT')
        }

        const images = Array.isArray(product.images) ? product.images : []

        orderItems.push({
          productId: product.id,
          productNameFr: product.nameFr,
          productNameAr: product.nameAr,
          unitPrice: roundMoney(unitPrice),
          image:
            typeof images[0] === 'string' ? images[0] : '/placeholder.svg',
          quantity: requested.quantity,
        })
      }

      total = roundMoney(total)

      // Création de la commande
      const created = await transaction.order.create({
        data: {
          number: `CMD-${new Date().getFullYear()}-${randomUUID()
            .slice(0, 8)
            .toUpperCase()}`,
          fullName: fullNameTrimmed,
          metaEventId,
          phone1: phone1Trimmed,
          phone2: phone2Trimmed,
          address: addressTrimmed,
          total,

          // Meta Pixel / Conversions API
          metaFbp,
          metaFbc,
          metaClientIp,
          metaUserAgent,
          metaEventSourceUrl,

          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      })

      // Décrémentation du stock (si le champ existe)
      for (const requested of requestedItems) {
        const product = byId.get(requested.productId)
        const stock = (product as { stock?: number | null } | undefined)?.stock
        if (typeof stock === 'number') {
          await transaction.product.update({
            where: { id: requested.productId },
            data: { stock: { decrement: requested.quantity } },
          })
        }
      }

      return created
    })

    // Récupération des paramètres de la boutique
    const settings = await prisma.storeSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    // Envoi de l'événement Purchase à Meta Conversions API
    try {
      await sendMetaEvent({
        eventName: 'Purchase',
        eventId: order.metaEventId ?? metaEventId,
        eventSourceUrl: order.metaEventSourceUrl ?? absoluteUrl('/commande'),
        fbp: order.metaFbp,
        fbc: order.metaFbc,
        clientIp: order.metaClientIp,
        userAgent: order.metaUserAgent,
        value: Number(order.total),
        currency: settings?.currency ?? 'TND',
        orderId: order.number,
        contents: order.items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          item_price: Number(item.unitPrice),
        })),
        productIds: order.items.map((item) => item.productId),
      })

      // Marque l'événement comme envoyé (idempotence / retry)
      await prisma.order.update({
        where: { id: order.id },
        data: { metaPurchaseSentAt: new Date() },
      })
    } catch (error) {
      console.error('Erreur envoi Purchase Meta:', error)
    }

    return NextResponse.json(serializeOrder(order), { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ORDER_PRODUCT_UNAVAILABLE':
          return apiError('Un produit n’est plus disponible.', 409)
        case 'ORDER_OUT_OF_STOCK':
          return apiError('Le stock est insuffisant pour un des produits.', 409)
        case 'ORDER_TOTAL_LIMIT':
          return apiError(
            'Le total de la commande dépasse la limite autorisée.',
            400
          )
      }
    }
    return reportApiError(error)
  }
}