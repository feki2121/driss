'use client'

import { AdminShell } from '@/components/admin/admin-shell'
import { DashboardView } from '@/components/admin/dashboard-view'

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <DashboardView />
    </AdminShell>
  )
}
