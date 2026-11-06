import type { Category as DbCategory, Order as DbOrder, Product as DbProduct, StoreSettings as DbSettings } from '@prisma/client'
import type { Category, Order, OrderStatus, Product } from '@/lib/types'

const statusToClient: Record<DbOrder['status'], OrderStatus> = {
  NEW: 'new',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export function serializeCategory(category: DbCategory): Category {
  return {
    id: category.id,
    slug: category.slug,
    name: { fr: category.nameFr, ar: category.nameAr },
    image: category.image,
  }
}

export function serializeProduct(product: DbProduct): Product {
  const images = Array.isArray(product.images)
    ? product.images.filter((image): image is string => typeof image === 'string')
    : []
  return {
    id: product.id,
    ref: product.ref,
    name: { fr: product.nameFr, ar: product.nameAr },
    description: { fr: product.descriptionFr, ar: product.descriptionAr },
    price: Number(product.price),
    promoPrice: product.promoPrice === null ? null : Number(product.promoPrice),
    images,
    categoryId: product.categoryId,
    // stock: product.stock,
    isNew: product.isNew,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
  }
}

type OrderWithItems = DbOrder & {
  items: Array<{
    productId: string
    productNameFr: string
    productNameAr: string
    unitPrice: DbOrder['total']
    image: string
    quantity: number
  }>
}

export function serializeOrder(order: OrderWithItems): Order {
  return {
    id: order.id,
    number: order.number,
    customer: {
      fullName: order.fullName,
      phone1: order.phone1,
      phone2: order.phone2 ?? undefined,
      address: order.address,
    },
    items: order.items.map((item) => ({
      productId: item.productId,
      name: { fr: item.productNameFr, ar: item.productNameAr },
      price: Number(item.unitPrice),
      image: item.image,
      quantity: item.quantity,
    })),
    total: Number(order.total),
    status: statusToClient[order.status],
    createdAt: order.createdAt.toISOString(),
  }
}

export function serializeSettings(settings: DbSettings | null) {
  return {
    storeName: settings?.storeName ?? 'Espace Baya',
    email: settings?.email ?? '',
    phone: settings?.phone ?? '',
    address: settings?.address ?? '',
    deliveryFee: Number(settings?.deliveryFee ?? 0),
    freeDeliveryThreshold:
      settings?.freeDeliveryThreshold == null
        ? null
        : Number(settings.freeDeliveryThreshold),
    whatsapp: settings?.whatsapp ?? '',
    currency: settings?.currency ?? 'DZD',
  }
}
