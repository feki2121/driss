'use client'

import { AdminShell } from '@/components/admin/admin-shell'
import { SettingsManager } from '@/components/admin/settings-manager'

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <SettingsManager />
    </AdminShell>
  )
}
