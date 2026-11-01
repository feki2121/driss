'use client'

import { use } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'
import { useStore } from '@/components/providers/store-provider'
import { ProductDetail } from '@/components/store/product-detail'
import { buttonVariants } from '@/components/ui/button'

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { t } = useLanguage()
  const { products } = useStore()
  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">{t('products.empty')}</p>
        <Link href="/produits" className={buttonVariants()}>
          {t('product.back')}
        </Link>
      </div>
    )
  }

  return <ProductDetail product={product} />
}
