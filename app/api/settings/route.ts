import { NextRequest, NextResponse } from 'next/server'
import { apiError, hasCrossOrigin, isOptionalString, isString, isValidMoney, readJson, reportApiError } from '@/lib/server/api'
import { getAdminFromRequest } from '@/lib/server/auth'
import { prisma } from '@/lib/server/prisma'
import { serializeSettings } from '@/lib/server/serializers'

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findFirst()
    return NextResponse.json(serializeSettings(settings))
  } catch (error) {
    return reportApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)
    const body = await readJson(request)
    if (
      !body ||
      !isString(body.storeName, 200) ||
      !isOptionalString(body.email, 254) ||
      (typeof body.email === 'string' && body.email.length > 0 &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) ||
      !isOptionalString(body.phone, 80) ||
      !isOptionalString(body.address, 1000) ||
      !isOptionalString(body.whatsapp, 80) ||
      !isValidMoney(body.deliveryFee) ||
      !(body.freeDeliveryThreshold === null || isValidMoney(body.freeDeliveryThreshold))
    ) return apiError('Les paramètres de la boutique sont invalides.', 400)

    const data = {
      storeName: body.storeName.trim(),
      email: body.email?.toString().trim() || null,
      phone: body.phone?.toString().trim() || null,
      address: body.address?.toString().trim() || null,
      whatsapp: body.whatsapp?.toString().trim() || null,
      deliveryFee: body.deliveryFee,
      freeDeliveryThreshold: body.freeDeliveryThreshold,
    }
    const existing = await prisma.storeSettings.findFirst()
    const settings = existing
      ? await prisma.storeSettings.update({ where: { id: existing.id }, data })
      : await prisma.storeSettings.create({ data })
    return NextResponse.json(serializeSettings(settings))
  } catch (error) {
    return reportApiError(error)
  }
}
