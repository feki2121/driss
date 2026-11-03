import { isString } from '@/lib/server/api'

export function parseCategoryInput(value: Record<string, unknown>) {
  const name = (value.name ?? {}) as Record<string, unknown>

  const error =
    !isString(name.fr, 100) ? 'Le nom (FR) est requis (100 caractères max).' :
    !isString(name.ar, 100) ? 'Le nom (AR) est requis (100 caractères max).' :
    null

  if (error) return { ok: false as const, error }

  return {
    ok: true as const,
    data: {
      nameFr: (name.fr as string).trim(),
      nameAr: (name.ar as string).trim(),
    },
  }
}