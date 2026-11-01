import { NextRequest, NextResponse } from 'next/server'
import { apiError, hasCrossOrigin, reportApiError } from '@/lib/server/api'
import { getAdminFromRequest } from '@/lib/server/auth'
import { prisma } from '@/lib/server/prisma'
import { serializeProduct } from '@/lib/server/serializers'
import { PATCH as patchProducts } from '@/lib/server/product-route'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const admin = await getAdminFromRequest(request)
    const product = await prisma.product.findFirst({
      where: { id, ...(admin ? {} : { isActive: true }) },
    })
    if (!product) return apiError('Produit introuvable.', 404)
    return NextResponse.json(serializeProduct(product))
  } catch (error) {
    return reportApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  return patchProducts(request, id)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)
    const { id } = await context.params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    return reportApiError(error)
  }
}
