'use client'

import { AdminShell } from '@/components/admin/admin-shell'
import { OrdersManager } from '@/components/admin/orders-manager'

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <OrdersManager />
    </AdminShell>
  )
}
