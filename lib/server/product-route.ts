import { NextRequest, NextResponse } from 'next/server'
import { apiError, hasCrossOrigin, readJson, reportApiError } from '@/lib/server/api'
import { getAdminFromRequest } from '@/lib/server/auth'
import { parseProductInput } from '@/lib/server/product-validation'
import { prisma } from '@/lib/server/prisma'
import { serializeProduct } from '@/lib/server/serializers'

export async function PATCH(request: NextRequest, id: string) {
  try {
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)
    const body = await readJson(request)
    if (!body) return apiError('Les données du produit sont invalides.', 400)
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) return apiError('Produit introuvable.', 404)
    const current = serializeProduct(existing)
    const incomingName = body.name && typeof body.name === 'object'
      ? body.name as Record<string, unknown>
      : {}
    const incomingDescription = body.description && typeof body.description === 'object'
      ? body.description as Record<string, unknown>
      : {}
    const merged = {
      ...current,
      ...body,
      name: { ...current.name, ...incomingName },
      description: { ...current.description, ...incomingDescription },
    }
    const data = parseProductInput(merged)
    if (!data) return apiError('Les données du produit sont invalides.', 400)
    const product = await prisma.product.update({ where: { id }, data })
    return NextResponse.json(serializeProduct(product))
  } catch (error) {
    return reportApiError(error)
  }
}
