'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import { buttonVariants } from '@/components/ui/button'

export function HomeHero() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
        <div className="flex flex-col items-start">
          <span className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {t('hero.eyebrow')}
          </span>
          <h1 className="mt-6 text-balance font-serif text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/produits" className={buttonVariants({ size: 'lg', className: 'gap-2' })}>
              {t('hero.cta')}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            <Link href="/produits?promo=1" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              {t('hero.cta2')}
            </Link>
          </div>
        </div>

        <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-xl md:aspect-square lg:aspect-4/3">
          <Image
            src="/products/hero-living.png"
            alt={t('hero.title')}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
