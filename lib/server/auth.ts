import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/server/prisma'

const COOKIE_NAME = 'baya-admin-session'
const SESSION_SECONDS = 60 * 60 * 12

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must contain at least 32 characters.')
  }
  return secret
}

function sign(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, hash] = storedHash.split('$')
  if (scheme !== 'scrypt' || !salt || !/^[a-f0-9]{128}$/i.test(hash ?? '')) {
    return false
  }
  const computed = scryptSync(password, salt, 64).toString('hex')
  return safeEqual(computed, hash)
}

export function createSessionToken(adminId: string) {
  const payload = `${adminId}.${Math.floor(Date.now() / 1000) + SESSION_SECONDS}`
  return `${payload}.${sign(payload)}`
}

export async function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const [adminId, expiresText, signature, ...rest] = token.split('.')
  if (!adminId || !expiresText || !signature || rest.length > 0) return null
  const expires = Number(expiresText)
  const payload = `${adminId}.${expiresText}`
  if (!Number.isSafeInteger(expires) || expires <= Math.floor(Date.now() / 1000)) return null
  if (!safeEqual(signature, sign(payload))) return null
  return prisma.admin.findUnique({ where: { id: adminId }, select: { id: true, email: true, name: true } })
}

export async function setAdminSession(adminId: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, createSessionToken(adminId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
