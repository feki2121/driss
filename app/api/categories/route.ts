import { NextRequest, NextResponse } from 'next/server'
import { apiError, hasCrossOrigin, readJson, reportApiError } from '@/lib/server/api'
import { getAdminFromRequest } from '@/lib/server/auth'
import { parseCategoryInput } from '@/lib/server/category-validation'
import { prisma } from '@/lib/server/prisma'
import { serializeCategory } from '@/lib/server/serializers'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { nameFr: 'asc' } })
    return NextResponse.json(categories.map(serializeCategory))
  } catch (error) {
    return reportApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)
     const body = await readJson(request)
    if (!body) return apiError('Corps de requête JSON invalide.', 400)

    const result = parseCategoryInput(body)
    if (!result.ok) return apiError(result.error, 422)

    const category = await prisma.category.create({ data: result.data })
    return NextResponse.json(serializeCategory(category), { status: 201 })
  } catch (error) {
  return reportApiError(error, {
    P2002: { message: 'Une catégorie avec ce nom ou ce slug existe déjà.' },
  })
}
}
