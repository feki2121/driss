'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import { useStore } from '@/components/providers/store-provider'
import { ProductSection } from '@/components/store/product-section'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

export function ProductDetail({ product }: { product: Product }) {
  const { t, tf, price } = useLanguage()
  const router = useRouter()
  const { products, categories } = useStore()
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)

  const category = categories.find((c) => c.id === product.categoryId)
  const outOfStock = product.stock <= 0
  const hasPromo =
    typeof product.promoPrice === 'number' && product.promoPrice < product.price
  const unitPrice = hasPromo ? (product.promoPrice as number) : product.price

  const related = products
    .filter(
      (p) =>
        p.isActive && p.categoryId === product.categoryId && p.id !== product.id,
    )
    .slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/produits"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        {t('product.back')}
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
            <Image
              src={product.images[active] || '/placeholder.svg'}
              alt={tf(product.name)}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    'relative size-20 overflow-hidden rounded-lg bg-muted ring-2 ring-transparent transition',
                    active === i && 'ring-primary',
                  )}
                >
                  <Image
                    src={img || '/placeholder.svg'}
                    alt={`${tf(product.name)} ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {category && (
            <Link
              href={`/produits?categorie=${category.slug}`}
              className="text-xs font-semibold uppercase tracking-[0.15em] text-primary hover:underline"
            >
              {tf(category.name)}
            </Link>
          )}
          <h1 className="mt-2 text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl">
            {tf(product.name)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('product.reference')} : {product.ref}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-bold text-foreground">
              {price(unitPrice)}
            </span>
            {hasPromo && (
              <span className="text-lg text-muted-foreground line-through">
                {price(product.price)}
              </span>
            )}
          </div>

          <div className="mt-4">
            {outOfStock ? (
              <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                {t('product.outOfStock')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Check className="size-4" />
                {t('product.inStock')} · {product.stock} {t('product.left')}
              </span>
            )}
          </div>

          <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
            {tf(product.description)}
          </p>

          {!outOfStock && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-lg border border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="-"
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  aria-label="+"
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <Button
                type="button"
                size="lg"
                className="flex-1 gap-2"
                onClick={() => router.push(`/commande?produit=${product.id}&quantite=${qty}`)}
              >
                <ShoppingBag className="size-5" />
                {t('product.order')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <ProductSection
          title={t('product.related')}
          products={related}
          className="px-0"
        />
      )}
    </div>
  )
}
