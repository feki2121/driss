'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import { ProductCard } from '@/components/store/product-card'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  subtitle?: string
  products: Product[]
  viewAllHref?: string
  className?: string
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  className,
}: Props) {
  const { t } = useLanguage()
  if (products.length === 0) return null

  return (
    <section className={cn('mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8', className)}>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:flex"
          >
            {t('products.viewAll')}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
