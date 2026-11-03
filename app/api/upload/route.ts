import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { apiError, hasCrossOrigin, reportApiError } from '@/lib/server/api'
import { getAdminFromRequest } from '@/lib/server/auth'

const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_SIZE = 3 * 1024 * 1024 // Vercel functions accept ~4 MB bodies

export async function POST(request: NextRequest) {
  try {
    if (hasCrossOrigin(request)) return apiError('Requête inter-origine refusée.', 403)
    if (!(await getAdminFromRequest(request))) return apiError('Authentification requise.', 401)

    const data = await request.formData().catch(() => null)
    const file = data?.get('file')
    if (!(file instanceof File)) return apiError('Aucun fichier reçu.', 400)
    const ext = TYPES[file.type]
    if (!ext) return apiError('Format non supporté (JPG, PNG ou WebP).', 415)
    if (file.size > MAX_SIZE) return apiError('Image trop lourde (3 Mo maximum).', 413)

    const blob = await put(`products/${crypto.randomUUID()}.${ext}`, file, { access: 'public' })
    return NextResponse.json({ url: blob.url }, { status: 201 })
  } catch (error) {
    return reportApiError(error)
  }
}