'use client'

import { AdminShell } from '@/components/admin/admin-shell'
import { ProductsManager } from '@/components/admin/products-manager'

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <ProductsManager />
    </AdminShell>
  )
}
