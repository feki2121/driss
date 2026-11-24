import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/server/prisma'
import { absoluteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { products: { some: { isActive: true } } },
      select: { slug: true, updatedAt: true },
    }),
  ])

  return [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/produits'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categories.map((category) => ({
      url: absoluteUrl(`/categories/${encodeURIComponent(category.slug)}`),
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/produits/${encodeURIComponent(product.id)}`),
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
