'use client'

import { Suspense } from 'react'
import { ProductsCatalog } from '@/components/store/products-catalog'

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductsCatalog />
    </Suspense>
  )
}
