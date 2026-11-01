'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

export function ProductCard({ product }: { product: Product }) {
  const { t, tf, price } = useLanguage()
  const router = useRouter()
  const outOfStock = product.stock <= 0
  const hasPromo =
    typeof product.promoPrice === 'number' && product.promoPrice < product.price

  return (
    <div className="group flex flex-col">
      <Link
        href={`/produits/${product.id}`}
        className="relative block aspect-square overflow-hidden rounded-xl bg-muted"
      >
        <Image
          src={product.images[0] || '/placeholder.svg'}
          alt={tf(product.name)}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'object-cover transition-transform duration-500 group-hover:scale-105',
            outOfStock && 'opacity-70',
          )}
        />
        <div className="absolute start-3 top-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
              {t('product.new')}
            </span>
          )}
          {hasPromo && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
              {t('product.promo')}
            </span>
          )}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background">
              {t('product.outOfStock')}
            </span>
          </div>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <Link
          href={`/produits/${product.id}`}
          className="font-medium leading-snug text-foreground transition-colors hover:text-primary"
        >
          {tf(product.name)}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">{product.ref}</p>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-foreground">
            {price(hasPromo ? (product.promoPrice as number) : product.price)}
          </span>
          {hasPromo && (
            <span className="text-sm text-muted-foreground line-through">
              {price(product.price)}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={outOfStock}
          onClick={() => router.push(`/commande?produit=${product.id}`)}
          className="mt-3 w-full gap-2"
        >
          <ShoppingBag className="size-4" />
          {t('product.order')}
        </Button>
      </div>
    </div>
  )
}
