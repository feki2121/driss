'use client'

import { AboutSection } from '@/components/store/about-section'
import { CategoryGrid } from '@/components/store/category-grid'
import { HomeHero } from '@/components/store/home-hero'
import { ProductSection } from '@/components/store/product-section'
import { useLanguage } from '@/components/providers/language-provider'
import { useStore } from '@/components/providers/store-provider'

export default function HomePage() {
  const { t } = useLanguage()
  const { products } = useStore()

  const active = products.filter((p) => p.isActive)
  const featured = active.filter((p) => p.isNew).slice(0, 4)
  const promo = active
    .filter((p) => typeof p.promoPrice === 'number' && p.promoPrice! < p.price)
    .slice(0, 4)

  return (
    <>
      <HomeHero />
      <CategoryGrid />
      <ProductSection
        title={t('products.featured')}
        subtitle={t('products.featuredSub')}
        products={featured}
        viewAllHref="/produits"
      />
      <ProductSection
        title={t('products.promo')}
        subtitle={t('products.promoSub')}
        products={promo}
        viewAllHref="/produits?promo=1"
      />
      <AboutSection />
    </>
  )
}
