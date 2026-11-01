'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { useAdmin } from '@/components/providers/admin-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const { t } = useLanguage()
  const { login, isAuthenticated, ready } = useAdmin()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (ready && isAuthenticated) router.replace('/admin')
  }, [ready, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError(t('checkout.required'))
      return
    }
    setSubmitting(true)
    try {
      const ok = await login(email, password)
      if (ok) router.replace('/admin')
      else setError(t('admin.login.error'))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'La connexion a échoué.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Lock className="size-5" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {t('admin.login.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.login.subtitle')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="email">{t('admin.login.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('admin.login.password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {t('admin.login.submit')}
          </Button>

          <p className="rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
            {t('admin.login.hint')}
          </p>
        </form>
      </div>
    </div>
  )
}
