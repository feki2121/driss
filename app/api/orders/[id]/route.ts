import { NextRequest, NextResponse } from 'next/server'
import { apiError, hasCrossOrigin, isString, readJson, reportApiError } from '@/lib/server/api'
import { getAdminFromRequest } from '@/lib/server/auth'
import { prisma } from '@/lib/server/prisma'
import { serializeOrder } from '@/lib/server/serializers'
import { sendMetaEvent } from '@/lib/server/meta-conversions'

type RouteContext = { params: Promise<{ id: string }> }
const statuses = {
  new: 'NEW',
  confirmed: 'CONFIRMED',
  preparing: 'PREPARING',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
} as const

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)
    const { id } = await context.params
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
    if (!order) return apiError('Commande introuvable.', 404)
    return NextResponse.json(serializeOrder(order))
  } catch (error) {
    return reportApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    if (hasCrossOrigin(request)) {
      return apiError('Requête inter-origine refusée.', 403)
    }

    if (!(await getAdminFromRequest(request))) {
      return apiError('Authentification requise.', 401)
    }

    const { id } = await context.params
    const body = await readJson(request)

    if (
      !body ||
      !isString(body.status, 20) ||
      !Object.prototype.hasOwnProperty.call(statuses, body.status)
    ) {
      return apiError('Statut de commande invalide.', 400)
    }

    const newStatus = statuses[
      body.status as keyof typeof statuses
    ]

    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: { items: true },
    })

    // Envoyer Purchase uniquement pour une commande confirmée
    // et si cet événement n'a pas encore été transmis.
    if (
      updated.status === 'CONFIRMED' &&
      !updated.metaPurchaseSentAt
    ) {
      try {
        const settings = await prisma.storeSettings.findFirst({
          orderBy: { updatedAt: 'desc' },
        })

        const eventId = `purchase_${updated.id}`

        await sendMetaEvent({
          eventName: 'Purchase',
          eventId,
          eventSourceUrl:
            updated.metaEventSourceUrl ||
            'https://espacebaya.vercel.app/',

          fbp: updated.metaFbp,
          fbc: updated.metaFbc,
          clientIp: updated.metaClientIp,
          userAgent: updated.metaUserAgent,

          value: Number(updated.total),
          currency: settings?.currency ?? 'DZD',

          productIds: updated.items.map(
            (item) => item.productId
          ),

          contents: updated.items.map((item) => ({
            id: item.productId,
            quantity: item.quantity,
            item_price: Number(item.unitPrice),
          })),

          orderId: updated.id,
        })

        // Marquer l'événement comme envoyé uniquement
        // après une réponse positive de Meta.
        await prisma.order.updateMany({
          where: {
            id: updated.id,
            metaPurchaseSentAt: null,
          },
          data: {
            metaPurchaseSentAt: new Date(),
          },
        })

      } catch (metaError) {
        // La commande reste confirmée même si Meta est indisponible.
        console.error(
          'Erreur envoi Purchase Meta:',
          metaError
        )
      }
    }

    return NextResponse.json(serializeOrder(updated))

  } catch (error) {
    return reportApiError(error, {
      P2025: {
        message: 'Commande introuvable.',
        status: 404,
      },
    })
  }
}


export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)

    const { id } = await context.params
    await prisma.order.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    return reportApiError(error, {
      P2025: { message: 'Commande introuvable.', status: 404 },
    })
  }
}