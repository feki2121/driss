'use client'

import { AdminShell } from '@/components/admin/admin-shell'
import { CategoriesManager } from '@/components/admin/categories-manager'

export default function AdminCategoriesPage() {
  return (
    <AdminShell>
      <CategoriesManager />
    </AdminShell>
  )
}
