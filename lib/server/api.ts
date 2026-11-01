import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json()
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export function reportApiError(error: unknown) {
  console.error('API request failed:', error)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return apiError('Cette valeur existe déjà.', 409)
    if (error.code === 'P2003' || error.code === 'P2014') {
      return apiError('Cette donnée est encore utilisée et ne peut pas être supprimée.', 409)
    }
    if (error.code === 'P2025') return apiError('Cette donnée est introuvable.', 404)
  }
  return apiError('Une erreur interne est survenue.', 500)
}

export function isString(value: unknown, maxLength = 5000): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

export function isOptionalString(value: unknown, maxLength = 5000) {
  return value === undefined || value === null || (typeof value === 'string' && value.length <= maxLength)
}

export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export function isValidMoney(value: unknown): value is number {
  return isNonNegativeNumber(value) &&
    value <= 99_999_999.99 &&
    Math.abs(value * 100 - Math.round(value * 100)) < 0.000001
}

export function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0
}

export function hasCrossOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).host !== request.headers.get('host')
  } catch {
    return true
  }
}
