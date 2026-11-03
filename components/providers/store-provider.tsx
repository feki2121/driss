'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { toast } from 'sonner'
import { useAdmin } from '@/components/providers/admin-provider'
import type { Category, Order, OrderStatus, Product } from '@/lib/types'

export type StoreSettings = {
  storeName: string
  email: string
  phone: string
  address: string
  deliveryFee: number
  freeDeliveryThreshold: number | null
  whatsapp: string
  currency: string
}

type ProductInput = Omit<Product, 'id' | 'createdAt'>
type CategoryInput = Omit<Category, 'id'>
type OrderInput = Omit<Order, 'id' | 'number' | 'createdAt' | 'status'>

type StoreContextValue = {
  products: Product[]
  categories: Category[]
  orders: Order[]
  settings: StoreSettings
  loading: boolean
  adminLoading: boolean
  addProduct: (product: ProductInput) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  addCategory: (category: CategoryInput) => Promise<void>
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addOrder: (order: OrderInput) => Promise<Order>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
  updateSettings: (settings: Partial<StoreSettings>) => Promise<void>
}

const EMPTY_SETTINGS: StoreSettings = {
  storeName: 'Espace Baya',
  email: '',
  phone: '',
  address: '',
  deliveryFee: 0,
  freeDeliveryThreshold: null,
  whatsapp: '',
  currency: 'DZD',
}

const StoreContext = createContext<StoreContextValue | null>(null)

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  let response: Response
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  try {
  response = await fetch(url, { ...init, headers })
} catch {
  throw new Error('Connexion impossible. Vérifiez votre réseau.')
}
  const body = (await response.json().catch(() => null)) as
    | T
    | { error?: string }
    | null
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body
      ? body.error
      : undefined
    throw new Error(message || `La requête a échoué (${response.status}).`)
  }
  return body as T
}

function productPayload(product: Partial<Product>) {
  const payload: Record<string, unknown> = {}
  if (product.ref !== undefined) payload.ref = product.ref
  if (product.name !== undefined) payload.name = product.name
  if (product.description !== undefined) payload.description = product.description
  if (product.price !== undefined) payload.price = product.price
  if (product.promoPrice !== undefined) payload.promoPrice = product.promoPrice
  if (product.images !== undefined) payload.images = product.images
  if (product.categoryId !== undefined) payload.categoryId = product.categoryId
  if (product.stock !== undefined) payload.stock = product.stock
  if (product.isNew !== undefined) payload.isNew = product.isNew
  if (product.isActive !== undefined) payload.isActive = product.isActive
  return payload
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdmin()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<StoreSettings>(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      request<Product[]>('/api/products', { cache: 'no-store' }),
      request<Category[]>('/api/categories', { cache: 'no-store' }),
      request<StoreSettings>('/api/settings', { cache: 'no-store' }),
    ])
      .then(([nextProducts, nextCategories, nextSettings]) => {
        if (!active) return
        setProducts(nextProducts)
        setCategories(nextCategories)
        setSettings(nextSettings)
      })
      .catch((error: unknown) => {
        if (active) {
          toast.error(error instanceof Error ? error.message : 'Impossible de charger les données.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    if (!isAuthenticated) {
      setOrders([])
      setAdminLoading(false)
      return
    }
    setAdminLoading(true)
    Promise.all([
      request<Product[]>('/api/products', { cache: 'no-store' }),
      request<Order[]>('/api/orders', { cache: 'no-store' }),
    ])
      .then(([nextProducts, nextOrders]) => {
        if (!active) return
        setProducts(nextProducts)
        setOrders(nextOrders)
      })
      .catch((error: unknown) => {
        if (active) toast.error(error instanceof Error ? error.message : 'Impossible de charger les données.')
      })
      .finally(() => {
        if (active) setAdminLoading(false)
      })
    return () => {
      active = false
    }
  }, [isAuthenticated])

  const addProduct = useCallback(async (product: ProductInput) => {
    const created = await request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
    setProducts((current) => [created, ...current])
  }, [])

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    const updated = await request<Product>(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(productPayload(product)),
    })
    setProducts((current) => current.map((item) => item.id === id ? updated : item))
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    await request<{ deleted: boolean }>(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
    setProducts((current) => current.filter((item) => item.id !== id))
  }, [])

  const addCategory = useCallback(async (category: CategoryInput) => {
    const created = await request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    })
    setCategories((current) => [...current, created])
  }, [])

  const updateCategory = useCallback(async (id: string, category: Partial<Category>) => {
    const updated = await request<Category>(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(category),
    })
    setCategories((current) => current.map((item) => item.id === id ? updated : item))
  }, [])

  const deleteCategory = useCallback(async (id: string) => {
    await request<{ deleted: boolean }>(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
    setCategories((current) => current.filter((item) => item.id !== id))
  }, [])

  const addOrder = useCallback(async (order: OrderInput) => {
    const created = await request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer: order.customer,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    })
    return created
  }, [])

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    const updated = await request<Order>(`/api/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    setOrders((current) => current.map((item) => item.id === id ? updated : item))
    setProducts(await request<Product[]>('/api/products', { cache: 'no-store' }))
  }, [])

  const updateSettings = useCallback(async (patch: Partial<StoreSettings>) => {
    const updated = await request<StoreSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ ...settings, ...patch }),
    })
    setSettings(updated)
  }, [settings])

  const value = useMemo(
    () => ({
      products,
      categories,
      orders,
      settings,
      loading,
      adminLoading,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      addOrder,
      updateOrderStatus,
      updateSettings,
    }),
    [
      products, categories, orders, settings, loading, adminLoading, addProduct, updateProduct,
      deleteProduct, addCategory, updateCategory, deleteCategory, addOrder,
      updateOrderStatus, updateSettings,
    ],
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status">
        <p className="text-sm text-muted-foreground">Chargement des données…</p>
      </div>
    )
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
