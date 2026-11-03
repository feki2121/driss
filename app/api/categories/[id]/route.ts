import { NextRequest, NextResponse } from 'next/server'
import { apiError, hasCrossOrigin, readJson, reportApiError } from '@/lib/server/api'
import { getAdminFromRequest } from '@/lib/server/auth'
import { parseCategoryInput } from '@/lib/server/category-validation'
import { prisma } from '@/lib/server/prisma'
import { serializeCategory } from '@/lib/server/serializers'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) return apiError('Catégorie introuvable.', 404)
    return NextResponse.json(serializeCategory(category))
  } catch (error) {
    return reportApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)
    const { id } = await context.params
    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) return apiError('Catégorie introuvable.', 404)
    const body = await readJson(request)
    if (!body) return apiError('Les données de la catégorie sont invalides.', 400)
    const name = body.name ?? { fr: existing.nameFr, ar: existing.nameAr }
    const input = parseCategoryInput({
      // slug: body.slug ?? existing.slug,
      // image: body.image ?? existing.image,
      name,
    })
    if (!input) return apiError('Les données de la catégorie sont invalides.', 400)
    const category = await prisma.category.update({ where: { id }, data: input })
    return NextResponse.json(serializeCategory(category))
  } catch (error) {
    return reportApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)
    const { id } = await context.params
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    return reportApiError(error)
  }
}
