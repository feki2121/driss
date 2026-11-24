import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductsCatalog } from '@/components/store/products-catalog'
import { prisma } from '@/lib/server/prisma'
import { serializeCategory, serializeProduct } from '@/lib/server/serializers'
import { absoluteUrl } from '@/lib/seo'

type RouteProps = { params: Promise<{ slug: string }> }

const getCategory = cache(async (slug: string) =>
  prisma.category.findFirst({
    where: { slug, products: { some: { isActive: true } } },
  }),
)

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: 'Catégorie introuvable',
      robots: { index: false, follow: false },
    }
  }

  const title = `Meubles ${category.nameFr}`
  const description = `Découvrez notre sélection de meubles ${category.nameFr} chez Espace Baya.`
  const image = category.image || '/products/hero-living.png'
  const imageUrl = new URL(image, absoluteUrl('/')).toString()

  return {
    title,
    description,
    keywords: [category.nameFr, 'meubles', 'mobilier'],
    alternates: { canonical: `/categories/${encodeURIComponent(slug)}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `/categories/${encodeURIComponent(slug)}`,
      siteName: 'Espace Baya',
      locale: 'fr_FR',
      images: [{ url: imageUrl, alt: category.nameFr }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function CategoryPage({ params }: RouteProps) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: category.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { products: { some: { isActive: true } } },
      orderBy: { nameFr: 'asc' },
    }),
  ])

  return (
    <ProductsCatalog
      key={slug}
      initialCategory={slug}
      initialProducts={products.map(serializeProduct)}
      initialCategories={categories.map(serializeCategory)}
    />
  )
}
