'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'
import {
  Boxes,
  Clock,
  Package,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import { useStore } from '@/components/providers/store-provider'
import { StatusBadge } from '@/components/admin/status-badge'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { OrderStatus } from '@/lib/types'

const STATUS_ORDER: OrderStatus[] = [
  'new',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
]

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'var(--color-chart-1)',
  confirmed: 'var(--color-chart-2)',
  preparing: 'var(--color-chart-4)',
  shipped: 'var(--color-chart-3)',
  delivered: 'var(--color-primary)',
  cancelled: 'var(--color-destructive)',
}

export function DashboardView() {
  const { t, tf, price, locale } = useLanguage()
  const { products, orders } = useStore()

  const revenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0),
    [orders],
  )
  const pending = orders.filter((o) => o.status === 'new').length
  const confirmed = orders.filter((o) =>
    ['confirmed', 'preparing', 'shipped', 'delivered'].includes(o.status),
  ).length

  const chartData = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status,
        label: t(`status.${status}`),
        count: orders.filter((o) => o.status === status).length,
        fill: STATUS_COLORS[status],
      })),
    [orders, t],
  )

  const topProducts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const o of orders) {
      for (const item of o.items) {
        counts.set(
          item.productId,
          (counts.get(item.productId) ?? 0) + item.quantity,
        )
      }
    }
    return [...counts.entries()]
      .map(([productId, qty]) => ({
        product: products.find((p) => p.id === productId),
        qty,
      }))
      .filter((x) => x.product)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [orders, products])

  const recent = [...orders]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'ar' ? 'ar-TN' : 'fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))

  const stats = [
    {
      label: t('admin.dash.totalProducts'),
      value: products.length,
      icon: Package,
    },
    {
      label: t('admin.dash.totalOrders'),
      value: orders.length,
      icon: ShoppingCart,
    },
    { label: t('admin.dash.pendingOrders'), value: pending, icon: Clock },
    {
      label: t('admin.dash.confirmedOrders'),
      value: confirmed,
      icon: Boxes,
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          {t('admin.dash.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('admin.dash.subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-3 font-serif text-3xl font-bold text-foreground">
                {s.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('admin.dash.revenue')}
          </span>
          <TrendingUp className="size-5 text-primary" />
        </div>
        <p className="mt-2 font-serif text-3xl font-bold text-foreground">
          {price(revenue)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold text-foreground">
            {t('admin.dash.salesChart')}
          </h2>
          <ChartContainer
            config={{ count: { label: t('admin.orders.title') } }}
            className="h-64 w-full"
          >
            <BarChart data={chartData} margin={{ left: -16 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={32}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.status} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold text-foreground">
            {t('admin.dash.topProducts')}
          </h2>
          <ul className="space-y-3">
            {topProducts.map(({ product, qty }, i) => (
              <li key={product!.id} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {tf(product!.name)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {qty} {t('admin.dash.ordered')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">
            {t('admin.dash.recentOrders')}
          </h2>
          <Link
            href="/admin/commandes"
            className="text-sm text-primary hover:underline"
          >
            {t('products.viewAll')}
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {recent.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{o.number}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {o.customer.fullName} · {fmtDate(o.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                <span className="text-sm font-medium text-foreground">
                  {price(o.total)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
