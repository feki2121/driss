import { isNonNegativeInteger, isString, isValidMoney } from '@/lib/server/api'

function isValidImageSource(value: string) {
  return (value.startsWith('/') && !value.startsWith('//')) || /^https:\/\//i.test(value)
}

export function parseProductInput(value: Record<string, unknown>) {
  const name = value.name as Record<string, unknown> | undefined
  const description = value.description as Record<string, unknown> | undefined
  const images = value.images
  if (
    !isString(value.ref, 80) ||
    !name || !isString(name.fr, 200) || !isString(name.ar, 200) ||
    !description || !isString(description.fr, 5000) || !isString(description.ar, 5000) ||
    !isValidMoney(value.price) ||
    !(value.promoPrice === null || value.promoPrice === undefined || isValidMoney(value.promoPrice)) ||
    !Array.isArray(images) || images.length > 20 ||
    !images.every((image) => typeof image === 'string' && image.length <= 2048 && isValidImageSource(image)) ||
    !isString(value.categoryId, 100) ||
    !isNonNegativeInteger(value.stock) ||
    typeof value.isNew !== 'boolean' ||
    typeof value.isActive !== 'boolean'
  ) return null

  if (value.promoPrice != null && Number(value.promoPrice) > Number(value.price)) return null
  return {
    ref: value.ref.trim(),
    nameFr: name.fr.trim(),
    nameAr: name.ar.trim(),
    descriptionFr: description.fr.trim(),
    descriptionAr: description.ar.trim(),
    price: value.price,
    promoPrice: value.promoPrice == null ? null : value.promoPrice,
    images,
    categoryId: value.categoryId,
    stock: value.stock,
    isNew: value.isNew,
    isActive: value.isActive,
  }
}
