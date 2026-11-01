import { NextRequest, NextResponse } from 'next/server'
import { apiError, hasCrossOrigin, isString, readJson, reportApiError } from '@/lib/server/api'
import {
  clearAdminSession,
  getAdminFromRequest,
  setAdminSession,
  verifyPassword,
} from '@/lib/server/auth'
import { prisma } from '@/lib/server/prisma'

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)
    return NextResponse.json({ authenticated: Boolean(admin) })
  } catch (error) {
    return reportApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    const body = await readJson(request)
    if (!body || !isString(body.email, 254) || !isString(body.password, 1024)) {
      return apiError('Adresse e-mail ou mot de passe invalide.', 400)
    }

    const admin = await prisma.admin.findUnique({
      where: { email: body.email.trim().toLowerCase() },
    })
    if (!admin || !verifyPassword(body.password, admin.passwordHash)) {
      return apiError('Adresse e-mail ou mot de passe incorrect.', 401)
    }
    await setAdminSession(admin.id)
    return NextResponse.json({ authenticated: true })
  } catch (error) {
    return reportApiError(error)
  }
}

export async function DELETE() {
  try {
    await clearAdminSession()
    return NextResponse.json({ authenticated: false })
  } catch (error) {
    return reportApiError(error)
  }
}
