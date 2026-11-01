'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { toast } from 'sonner'

type AdminContextValue = {
  isAuthenticated: boolean
  ready: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/admin/session', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Impossible de vérifier la session administrateur.')
        const data = (await response.json()) as { authenticated: boolean }
        if (active) setIsAuthenticated(data.authenticated)
      })
      .catch((error: unknown) => {
        if (active) toast.error(error instanceof Error ? error.message : 'Erreur de connexion.')
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (response.status === 401) return false
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null
      throw new Error(body?.error || 'La connexion a échoué.')
    }
    setIsAuthenticated(true)
    return true
  }, [])

  const logout = useCallback(() => {
    void fetch('/api/admin/session', { method: 'DELETE' })
      .then(async (response) => {
        if (!response.ok) throw new Error('La déconnexion a échoué.')
        setIsAuthenticated(false)
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : 'Erreur de connexion.')
      })
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, ready, login, logout }),
    [isAuthenticated, ready, login, logout],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
