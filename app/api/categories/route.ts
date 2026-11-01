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
    const input = body ? parseCategoryInput(body) : null
    if (!input) return apiError('Les données de la catégorie sont invalides.', 400)
    const category = await prisma.category.create({ data: input })
    return NextResponse.json(serializeCategory(category), { status: 201 })
  } catch (error) {
    return reportApiError(error)
  }
}
