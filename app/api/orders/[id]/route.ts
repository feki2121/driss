import { NextRequest, NextResponse } from 'next/server'
import { apiError, hasCrossOrigin, isString, readJson, reportApiError } from '@/lib/server/api'
import { getAdminFromRequest } from '@/lib/server/auth'
import { prisma } from '@/lib/server/prisma'
import { serializeOrder } from '@/lib/server/serializers'

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)
    const { id } = await context.params
    const body = await readJson(request)
    if (!body || !isString(body.status, 20) || !Object.prototype.hasOwnProperty.call(statuses, body.status)) {
      return apiError('Statut de commande invalide.', 400)
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const current = await transaction.order.findUnique({ where: { id }, include: { items: true } })
      if (!current) return null
      const nextStatus = statuses[body.status as keyof typeof statuses]
      if (current.status !== nextStatus) {
        if (nextStatus === 'CANCELLED') {
          for (const item of current.items) {
            await transaction.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          }
        } else if (current.status === 'CANCELLED') {
          for (const item of current.items) {
            const changed = await transaction.product.updateMany({
              where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            })
            if (changed.count !== 1) throw new Error('ORDER_OUT_OF_STOCK')
          }
        }
      }
      return transaction.order.update({
        where: { id },
        data: { status: nextStatus },
        include: { items: true },
      })
    })
    if (!updated) return apiError('Commande introuvable.', 404)
    return NextResponse.json(serializeOrder(updated))
  } catch (error) {
    if (error instanceof Error && error.message === 'ORDER_OUT_OF_STOCK') {
      return apiError('Le stock est insuffisant pour réactiver cette commande.', 409)
    }
    return reportApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)
    const { id } = await context.params
    await prisma.$transaction(async (transaction) => {
      const order = await transaction.order.findUnique({ where: { id }, include: { items: true } })
      if (!order) throw new Error('ORDER_NOT_FOUND')
      if (order.status !== 'CANCELLED') {
        for (const item of order.items) {
          await transaction.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }
      await transaction.order.delete({ where: { id } })
    })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'ORDER_NOT_FOUND') {
      return apiError('Commande introuvable.', 404)
    }
    return reportApiError(error)
  }
}
