import { isString } from '@/lib/server/api'

export function parseCategoryInput(value: Record<string, unknown>) {
  const name = value.name as Record<string, unknown> | undefined
  if (
    !isString(value.slug, 100) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug) ||
    !name || !isString(name.fr, 200) || !isString(name.ar, 200) ||
    !isString(value.image, 2048) ||
    !(value.image.startsWith('/') && !value.image.startsWith('//')) &&
      !/^https:\/\//i.test(value.image)
  ) return null
  return {
    slug: value.slug,
    nameFr: name.fr.trim(),
    nameAr: name.ar.trim(),
    image: value.image,
  }
}
