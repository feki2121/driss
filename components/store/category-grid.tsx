'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'
import { useStore } from '@/components/providers/store-provider'

export function CategoryGrid() {
  const { t, tf } = useLanguage()
  const { categories, products } = useStore()

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-1 text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
          {t('categories.title')}
        </h2>
        <p className="text-muted-foreground">{t('categories.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.map((c) => {
          const count = products.filter(
            (p) => p.categoryId === c.id && p.isActive,
          ).length
          return (
            <Link
              key={c.id}
              href={`/produits?categorie=${c.slug}`}
              className="group relative aspect-4/3 overflow-hidden rounded-xl bg-muted"
            >
              <Image
                src={c.image || '/placeholder.svg'}
                alt={tf(c.name)}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-serif text-lg font-semibold text-background">
                  {tf(c.name)}
                </p>
                <p className="text-xs text-background/80">
                  {count} {t('categories.products')}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
