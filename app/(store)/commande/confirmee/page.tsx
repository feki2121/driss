'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Order } from '@/lib/types'

export default function ConfirmationPage() {
  const { t, tf, price } = useLanguage()
  const [order, setOrder] = useState<Order | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = window.sessionStorage.getItem('baya-last-order')
    if (stored) {
      try {
        setOrder(JSON.parse(stored) as Order)
      } catch {
        setOrder(null)
      }
    }
    setLoaded(true)
  }, [])

  if (!loaded) return <div className="min-h-[60vh]" />

  if (!order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">{t('cart.empty')}</p>
        <Link href="/produits" className={buttonVariants()}>
          {t('confirm.shop')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-9" />
        </div>
        <h1 className="mt-5 text-balance font-serif text-3xl font-bold text-foreground">
          {t('confirm.title')}
        </h1>
        <p className="mt-2 text-muted-foreground">{t('confirm.message')}</p>
        <p className="mt-4 rounded-full bg-muted px-4 py-1.5 text-sm">
          {t('confirm.number')} :{' '}
          <span className="font-semibold text-foreground">{order.number}</span>
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-bold text-foreground">
          {t('confirm.recap')}
        </h2>

        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t('confirm.customer')}
          </p>
          <p className="mt-1 font-medium text-foreground">
            {order.customer.fullName}
          </p>
          <p className="text-sm text-muted-foreground">{order.customer.phone1}</p>
          <p className="text-sm text-muted-foreground">{order.customer.address}</p>
        </div>

        <Separator className="my-5" />

        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {t('confirm.products')}
        </p>
        <ul className="mt-3 space-y-2">
          {order.items.map((item) => (
            <li
              key={item.productId}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-foreground">
                {tf(item.name)}{' '}
                <span className="text-muted-foreground">× {item.quantity}</span>
              </span>
              <span className="font-medium text-foreground">
                {price(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <Separator className="my-5" />

        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">{t('confirm.total')}</span>
          <span className="font-serif text-xl font-bold text-foreground">
            {price(order.total)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/" className={buttonVariants({ variant: 'outline' })}>
          {t('confirm.home')}
        </Link>
        <Link href="/produits" className={buttonVariants()}>
          {t('confirm.shop')}
        </Link>
      </div>
    </div>
  )
}
