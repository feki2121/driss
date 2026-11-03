import { isIntegerInRange, isString, isText, isValidMoney } from '@/lib/server/api'

function isValidImageSource(value: string) {
  return (value.startsWith('/') && !value.startsWith('//')) || /^https:\/\//i.test(value)
}

export function parseProductInput(value: Record<string, unknown>) {
  const name = (value.name ?? {}) as Record<string, unknown>
  const description = (value.description ?? {}) as Record<string, unknown>
  const images = value.images

  const error =
    !isString(value.ref, 80) ? 'Référence invalide (80 caractères max).' :
    !isString(name.fr, 200) ? 'Le nom (FR) est requis (200 caractères max).' :
    !isString(name.ar, 200) ? 'Le nom (AR) est requis (200 caractères max).' :
    !isText(description.fr, 5000) ? 'Description (FR) trop longue.' :
    !isText(description.ar, 5000) ? 'Description (AR) trop longue.' :
    !isValidMoney(value.price) ? 'Prix invalide.' :
    !(value.promoPrice == null || isValidMoney(value.promoPrice)) ? 'Prix promo invalide.' :
    value.promoPrice != null && Number(value.promoPrice) > Number(value.price)
      ? 'Le prix promo doit être inférieur ou égal au prix.' :
    !Array.isArray(images) || images.length > 20 ? 'Images invalides (20 maximum).' :
    !images.every((i) => typeof i === 'string' && i.length <= 2048 && isValidImageSource(i))
      ? 'Chaque image doit être un chemin local (/...) ou une URL https.' :
    !isString(value.categoryId, 100) ? 'La catégorie est requise.' :
    !isIntegerInRange(value.stock, 1_000_000) ? 'Le stock doit être un entier positif ou nul.' :
    typeof value.isNew !== 'boolean' || typeof value.isActive !== 'boolean'
      ? 'Valeurs invalides.' :
    null

  if (error) return { ok: false as const, error }

  return {
    ok: true as const,
    data: {
      ref: (value.ref as string).trim(),
      nameFr: (name.fr as string).trim(),
      nameAr: (name.ar as string).trim(),
      descriptionFr: (description.fr as string).trim(),
      descriptionAr: (description.ar as string).trim(),
      price: value.price as number,
      promoPrice: value.promoPrice == null ? null : (value.promoPrice as number),
      images: images as string[],
      categoryId: value.categoryId as string,
      stock: value.stock as number,
      isNew: value.isNew as boolean,
      isActive: value.isActive as boolean,
    },
  }
}