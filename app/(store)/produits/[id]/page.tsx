import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/server/prisma'
import { serializeProduct } from '@/lib/server/serializers'
import { absoluteUrl, getSiteUrl } from '@/lib/seo'
import { ProductDetail } from '@/components/store/product-detail'

type RouteProps = { params: Promise<{ id: string }> }

const getProductData = cache(async (id: string) => {
  const [product, settings] = await Promise.all([
    prisma.product.findFirst({
      where: { id, isActive: true },
      include: { category: { select: { nameFr: true } } },
    }),
    prisma.storeSettings.findFirst({ orderBy: { updatedAt: 'desc' } }),
  ])
  return { product, settings }
})

function getCurrentPrice(product: {
  price: { toString(): string }
  promoPrice: { toString(): string } | null
}) {
  const regularPrice = Number(product.price)
  const promoPrice =
    product.promoPrice === null ? null : Number(product.promoPrice)
  return promoPrice !== null && promoPrice < regularPrice
    ? promoPrice
    : regularPrice
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { id } = await params
  const { product, settings } = await getProductData(id)

  if (!product) {
    return {
      title: 'Produit introuvable',
      robots: { index: false, follow: false },
    }
  }

  const title = product.nameFr
  const storeName = settings?.storeName ?? 'Espace Baya'
  const currency = settings?.currency ?? 'TND'
  const price = getCurrentPrice(product)
  const details = `Prix : ${price} ${currency}. Marque : ${storeName}.`
  const description = product.descriptionFr
    ? `${product.descriptionFr.slice(0, Math.max(0, 155 - details.length))} ${details}`
    : `Découvrez ${product.nameFr}. ${details}`
  const image = Array.isArray(product.images)
    ? product.images.find(
        (value): value is string => typeof value === 'string',
      )
    : undefined

  return {
    title,
    description,
    keywords: [product.nameFr, product.category.nameFr, 'meuble', 'mobilier'],
    alternates: { canonical: `/produits/${encodeURIComponent(id)}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `/produits/${encodeURIComponent(id)}`,
      siteName: 'Espace Baya',
      locale: 'fr_FR',
      images: [
        {
          url: image ?? '/products/hero-living.png',
          alt: product.nameFr,
        },
      ],
    },
    other: {
      'product:brand': storeName,
      'product:price:amount': String(price),
      'product:price:currency': currency,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image ?? '/products/hero-living.png'],
    },
  }
}

export default async function ProductPage({ params }: RouteProps) {
  const { id } = await params
  const { product, settings } = await getProductData(id)
  if (!product) notFound()

  const productData = serializeProduct(product)
  const siteName = settings?.storeName ?? 'Espace Baya'
  const currency = settings?.currency ?? 'TND'
  const imageUrls = productData.images.map((image) =>
    new URL(image, getSiteUrl()).toString(),
  )
  const price = getCurrentPrice(product)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nameFr,
    description: product.descriptionFr,
    image: imageUrls.length ? imageUrls : [absoluteUrl('/placeholder.svg')],
    sku: product.ref,
    category: product.category.nameFr,
    brand: { '@type': 'Brand', name: siteName },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/produits/${encodeURIComponent(id)}`),
      price,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <ProductDetail
  product={productData}
  currency={currency}
/>
    </>
  )
}
