import { isString } from '@/lib/server/api'
import { isValidImageSource } from './product-validation'

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
export function parseCategoryInput(value: Record<string, unknown>) {
  const name = (value.name ?? {}) as Record<string, unknown>
  const rawSlug = typeof value.slug === 'string' ? value.slug.trim() : ''
  const slug = isString(name.fr, 100) ? slugify(rawSlug || name.fr) : ''
  const image = typeof value.image === 'string' ? value.image.trim() : ''

  const error =
    !isString(name.fr, 100) ? 'Le nom (FR) est requis (100 caractères max).' :
    !isString(name.ar, 100) ? 'Le nom (AR) est requis (100 caractères max).' :
    rawSlug.length > 100 ? 'Le slug est trop long (100 caractères max).' :
    !slug ? 'Le slug doit contenir des lettres (a-z) ou des chiffres.' :
    !image ? 'L’image est requise.' :
    image.length > 2048 || !isValidImageSource(image)
      ? 'L’image doit être un chemin local (/...) ou une URL https.' :
    null

  if (error) return { ok: false as const, error }

  return {
    ok: true as const,
    data: {
      slug,
      nameFr: (name.fr as string).trim(),
      nameAr: (name.ar as string).trim(),
      image,
    },
  }
}