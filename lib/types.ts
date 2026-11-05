export type Locale = 'fr' | 'ar'

export type LocalizedText = {
  fr: string
  ar: string
}

export type Category = {
  id: string
  slug: string
  name: LocalizedText
  image: string
}

export type Product = {
  id: string
  ref: string
  name: LocalizedText
  description: LocalizedText
  price: number
  promoPrice?: number | null
  images: string[]
  categoryId: string
  // stock: number
  isNew: boolean
  isActive: boolean
  createdAt: string
}

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type CartItem = {
  productId: string
  name: LocalizedText
  price: number
  image: string
  quantity: number
}

export type Customer = {
  fullName: string
  phone1: string
  phone2?: string
  address: string
}

export type Order = {
  id: string
  number: string
  customer: Customer
  items: CartItem[]
  total: number
  status: OrderStatus
  createdAt: string
}
