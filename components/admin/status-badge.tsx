'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/lib/types'

const STYLES: Record<OrderStatus, string> = {
  new: 'bg-chart-1/15 text-chart-1',
  confirmed: 'bg-chart-2/15 text-chart-2',
  preparing: 'bg-chart-4/20 text-chart-4',
  shipped: 'bg-chart-3/15 text-chart-3',
  delivered: 'bg-primary/15 text-primary',
  cancelled: 'bg-destructive/15 text-destructive',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useLanguage()
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        STYLES[status],
      )}
    >
      {t(`status.${status}`)}
    </span>
  )
}
