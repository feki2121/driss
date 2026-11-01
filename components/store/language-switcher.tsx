'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage()

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-medium',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLocale('fr')}
        className={cn(
          'rounded-full px-3 py-1 transition-colors',
          locale === 'fr'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-pressed={locale === 'fr'}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLocale('ar')}
        className={cn(
          'rounded-full px-3 py-1 transition-colors',
          locale === 'ar'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-pressed={locale === 'ar'}
      >
        عربي
      </button>
    </div>
  )
}
