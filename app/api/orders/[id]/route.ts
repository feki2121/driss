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

    const updated = await prisma.order.update({
      where: { id },
      data: { status: statuses[body.status as keyof typeof statuses] },
      include: { items: true },
    })
    return NextResponse.json(serializeOrder(updated))
  } catch (error) {
    // P2025 (order not found) is handled by reportApiError → 404 "Cette donnée est introuvable."
    return reportApiError(error, {
      P2025: { message: 'Commande introuvable.', status: 404 },
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