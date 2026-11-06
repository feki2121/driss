import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { apiError, hasCrossOrigin, isString, readJson, reportApiError } from '@/lib/server/api'
import { getAdminFromRequest } from '@/lib/server/auth'
import { prisma } from '@/lib/server/prisma'
import { serializeOrder } from '@/lib/server/serializers'

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return /^[0-9\s+().-]{8,40}$/.test(value.trim()) && digits.length >= 8 && digits.length <= 15
}

export async function GET(request: NextRequest) {
  try {
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)
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
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    const body = await readJson(request)
    const customer = body?.customer as Record<string, unknown> | undefined
    const items = body?.items
    const fullName = customer?.fullName
    const phone1 = customer?.phone1
    const phone2 = customer?.phone2
    const address = customer?.address
    if (
      !customer ||
      !isString(fullName, 200) ||
      !isString(phone1, 40) ||
      !(phone2 === undefined || phone2 === null || (typeof phone2 === 'string' && phone2.length <= 40)) ||
      !isValidPhone(phone1) ||
      (typeof phone2 === 'string' && phone2.trim().length > 0 && !isValidPhone(phone2)) ||
      !isString(address, 1000) ||
      !Array.isArray(items) || items.length < 1 || items.length > 50
    ) return apiError('Les informations de commande sont invalides.', 400)

    const requestedItems: Array<{ productId: string; quantity: number }> = []
    const ids = new Set<string>()
    for (const item of items) {
      if (
        !item || typeof item !== 'object' ||
        !isString((item as Record<string, unknown>).productId, 100) ||
        !Number.isSafeInteger((item as Record<string, unknown>).quantity) ||
        Number((item as Record<string, unknown>).quantity) < 1 ||
        Number((item as Record<string, unknown>).quantity) > 100
      ) return apiError('Les articles de la commande sont invalides.', 400)
      const { productId, quantity } = item as { productId: string; quantity: number }
      if (ids.has(productId)) return apiError('Un article ne peut apparaître qu’une seule fois.', 400)
      ids.add(productId)
      requestedItems.push({ productId, quantity })
    }

   const order = await prisma.$transaction(async (transaction) => {
  const products = await transaction.product.findMany({
    where: { id: { in: requestedItems.map((item) => item.productId) }, isActive: true },
  })
  if (products.length !== requestedItems.length) {
    throw new Error('ORDER_PRODUCT_UNAVAILABLE')
  }

  const byId = new Map(products.map((product) => [product.id, product]))
  const orderItems = []
  let total = 0
  for (const requested of requestedItems) {
    const product = byId.get(requested.productId)
    if (!product) throw new Error('ORDER_PRODUCT_UNAVAILABLE')
    const unitPrice = product.promoPrice != null && Number(product.promoPrice) < Number(product.price)
      ? Number(product.promoPrice)
      : Number(product.price)
    total += unitPrice * requested.quantity
    // if (total > 99_999_999.99) throw new Error('ORDER_TOTAL_LIMIT')
    const images = Array.isArray(product.images) ? product.images : []
    orderItems.push({
      productId: product.id,
      productNameFr: product.nameFr,
      productNameAr: product.nameAr,
      unitPrice,
      image: typeof images[0] === 'string' ? images[0] : '/placeholder.svg',
      quantity: requested.quantity,
    })
  }

  return transaction.order.create({
    data: {
      number: `CMD-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
      fullName: fullName.trim(),
      phone1: phone1.trim(),
      phone2: typeof phone2 === 'string' && phone2.trim() ? phone2.trim() : null,
      address: address.trim(),
      total,
      items: { create: orderItems },
    },
    include: { items: true },
  })
})
    return NextResponse.json(serializeOrder(order), { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'ORDER_PRODUCT_UNAVAILABLE') {
      return apiError('Un produit n’est plus disponible.', 409)
    }
    if (error instanceof Error && error.message === 'ORDER_OUT_OF_STOCK') {
      return apiError('Le stock est insuffisant pour un des produits.', 409)
    }
    if (error instanceof Error && error.message === 'ORDER_TOTAL_LIMIT') {
      return apiError('Le total de la commande dépasse la limite autorisée.', 400)
    }
    return reportApiError(error)
  }
}
