'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  X,
} from 'lucide-react'
import { useAdmin } from '@/components/providers/admin-provider'
import { useStore } from '@/components/providers/store-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { LanguageSwitcher } from '@/components/store/language-switcher'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', key: 'admin.nav.dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/produits', key: 'admin.nav.products', icon: Package },
  { href: '/admin/categories', key: 'admin.nav.categories', icon: Tags },
  { href: '/admin/commandes', key: 'admin.nav.orders', icon: ShoppingCart },
  { href: '/admin/parametres', key: 'admin.nav.settings', icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage()
  const { isAuthenticated, ready, logout } = useAdmin()
  const { adminLoading } = useStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace('/admin/connexion')
  }, [ready, isAuthenticated, router])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (!ready || !isAuthenticated || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30" role="status">
        <p className="text-sm text-muted-foreground">Chargement des données…</p>
      </div>
    )
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(item.href, item.exact)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
            )}
          >
            <Icon className="size-5" />
            {t(item.key)}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col border-e border-sidebar-border bg-sidebar p-4 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-2 px-2">
          <span className="font-serif text-xl font-bold text-sidebar-foreground">
            {t('brand.name')}
          </span>
        </Link>
        {nav}
        <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ExternalLink className="size-5" />
            {t('admin.nav.viewSite')}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-5" />
            {t('admin.nav.logout')}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label={t('nav.close')}
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 start-0 flex w-64 flex-col border-e border-sidebar-border bg-sidebar p-4">
            <div className="mb-8 flex items-center justify-between px-2">
              <span className="font-serif text-xl font-bold text-sidebar-foreground">
                {t('brand.name')}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            {nav}
            <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border pt-4">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <ExternalLink className="size-5" />
                {t('admin.nav.viewSite')}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="size-5" />
                {t('admin.nav.logout')}
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:ps-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t('nav.menu')}
          >
            <Menu className="size-5" />
          </Button>
          <div className="ms-auto">
            <LanguageSwitcher />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
