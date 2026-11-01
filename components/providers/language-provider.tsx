'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Locale, LocalizedText } from '@/lib/types'
import {
  DEFAULT_LOCALE,
  formatPrice as fmt,
  translations,
} from '@/lib/i18n'

type LanguageContextValue = {
  locale: Locale
  dir: 'ltr' | 'rtl'
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  tf: (value: LocalizedText) => string
  price: (value: number) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Keep the locale unresolved until the browser can read the preference. This
  // prevents a persisted Arabic preference from changing translated markup
  // between the server render and the first client render.
  const [locale, setLocaleState] = useState<Locale | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem('baya-locale') as Locale | null
    setLocaleState(stored === 'fr' || stored === 'ar' ? stored : DEFAULT_LOCALE)
  }, [])

  const activeLocale = locale ?? DEFAULT_LOCALE
  const dir: 'ltr' | 'rtl' = activeLocale === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('lang', activeLocale)
    root.setAttribute('dir', dir)
  }, [activeLocale, dir])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem('baya-locale', next)
  }, [])

  const t = useCallback(
    (key: string) => translations[activeLocale][key] ?? key,
    [activeLocale],
  )

  const tf = useCallback((value: LocalizedText) => value[activeLocale], [activeLocale])

  const price = useCallback((value: number) => fmt(value, activeLocale), [activeLocale])

  const value = useMemo(
    () => ({ locale: activeLocale, dir, setLocale, t, tf, price }),
    [activeLocale, dir, setLocale, t, tf, price],
  )

  if (!locale) return null

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
