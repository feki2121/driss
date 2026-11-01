'use client'

import { AdminProvider } from './admin-provider'
import { LanguageProvider } from './language-provider'
import { StoreProvider } from './store-provider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AdminProvider>
        <StoreProvider>{children}</StoreProvider>
      </AdminProvider>
    </LanguageProvider>
  )
}
