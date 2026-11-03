import { NextRequest, NextResponse } from 'next/server'
import { apiError, hasCrossOrigin, readJson, reportApiError } from '@/lib/server/api'
import { getAdminFromRequest } from '@/lib/server/auth'
import { parseProductInput } from '@/lib/server/product-validation'
import { prisma } from '@/lib/server/prisma'
import { serializeProduct } from '@/lib/server/serializers'

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)
    const products = await prisma.product.findMany({
      where: admin ? undefined : { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products.map(serializeProduct))
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

    const result = parseProductInput(body)
    if (!result.ok) return apiError(result.error, 422)

    const product = await prisma.product.create({ data: result.data })
    return NextResponse.json(serializeProduct(product), { status: 201 })
  } catch (error) {
    return reportApiError(error, {
      P2002: { message: 'Cette référence est déjà utilisée.' },
      P2003: { message: 'Cette catégorie n’existe pas.', status: 400 },
    })
  }
}
