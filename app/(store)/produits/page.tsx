import { Suspense } from 'react'
import { ProductsCatalog } from '@/components/store/products-catalog'
import { prisma } from '@/lib/server/prisma'
import { serializeCategory, serializeProduct } from '@/lib/server/serializers'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { products: { some: { isActive: true } } },
      orderBy: { nameFr: 'asc' },
    }),
  ])

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductsCatalog
        initialProducts={products.map(serializeProduct)}
        initialCategories={categories.map(serializeCategory)}
      />
    </Suspense>
  )
}
