'use client'

import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { useStore } from '@/components/providers/store-provider'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Order, OrderStatus } from '@/lib/types'

const STATUSES: OrderStatus[] = [
  'new',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
]

export function OrdersManager() {
  const { t, tf, price, locale } = useLanguage()
  const { orders, products, updateOrderStatus } = useStore()

  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [selected, setSelected] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)

  const filtered = useMemo(() => {
    const list =
      filter === 'all' ? orders : orders.filter((o) => o.status === filter)
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [orders, filter])

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'ar' ? 'ar-TN' : 'fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))

  const productName = (id: string) => {
    const p = products.find((x) => x.id === id)
    return p ? tf(p.name) : id
  }

  const handleStatus = async (order: Order, status: OrderStatus) => {
    setUpdating(true)
    try {
      await updateOrderStatus(order.id, status)
      setSelected((prev) => (prev ? { ...prev, status } : prev))
      toast.success(t('admin.orders.statusUpdated'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de modifier la commande.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {t('admin.orders.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('admin.orders.subtitle')}
          </p>
        </div>
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as OrderStatus | 'all')}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.orders.allStatuses')}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.orders.number')}</TableHead>
              <TableHead>{t('admin.orders.customer')}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t('admin.orders.date')}
              </TableHead>
              <TableHead>{t('admin.orders.total')}</TableHead>
              <TableHead>{t('admin.orders.status')}</TableHead>
              <TableHead className="text-end">
                {t('admin.products.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium text-foreground">
                  {o.number}
                </TableCell>
                <TableCell>
                  <p className="text-foreground">{o.customer.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.customer.phone1}
                  </p>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {fmtDate(o.createdAt)}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {price(o.total)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell className="text-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelected(o)}
                    aria-label={t('admin.orders.view')}
                  >
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  {t('admin.orders.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {selected.number}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-2 text-sm">
                <section className="rounded-xl bg-muted/50 p-4">
                  <h3 className="mb-2 font-medium text-foreground">
                    {t('admin.orders.customer')}
                  </h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p className="text-foreground">
                      {selected.customer.fullName}
                    </p>
                    <p>{selected.customer.phone1}</p>
                    {selected.customer.phone2 && (
                      <p>{selected.customer.phone2}</p>
                    )}
                    <p>{selected.customer.address}</p>
                  </div>
                </section>

                <section>
                  <h3 className="mb-2 font-medium text-foreground">
                    {t('admin.orders.items')}
                  </h3>
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {selected.items.map((item) => (
                      <li
                        key={item.productId}
                        className="flex items-center justify-between gap-3 p-3"
                      >
                        <span className="min-w-0 flex-1 truncate text-foreground">
                          {productName(item.productId)}
                        </span>
                        <span className="text-muted-foreground">
                          {item.quantity} × {price(item.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-1">
                  <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                    <span>{t('cart.total')}</span>
                    <span>{price(selected.total)}</span>
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="font-medium text-foreground">
                    {t('admin.orders.updateStatus')}
                  </h3>
                  <Select
                    value={selected.status}
                    onValueChange={(v) =>
                      handleStatus(selected, v as OrderStatus)
                    }
                  >
                    <SelectTrigger disabled={updating}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`status.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
