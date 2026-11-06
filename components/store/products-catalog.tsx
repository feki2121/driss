'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import { useStore } from '@/components/providers/store-provider'
import { ProductCard } from '@/components/store/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

type Sort = 'newest' | 'priceAsc' | 'priceDesc'

export function ProductsCatalog() {
  const { t, tf } = useLanguage()
  const { products, categories } = useStore()
  const params = useSearchParams()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>(
    () => params.get('categorie') ?? 'all',
  )
  const [sort, setSort] = useState<Sort>('newest')
  const [onlyPromo, setOnlyPromo] = useState(() => params.get('promo') === '1')

  const hasPromo = (p: (typeof products)[number]) =>
    typeof p.promoPrice === 'number' && p.promoPrice < p.price

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.isActive)

    if (category !== 'all') {
      const cat = categories.find((c) => c.slug === category)
      if (cat) list = list.filter((p) => p.categoryId === cat.id)
    }
    if (onlyPromo) list = list.filter(hasPromo)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.fr.toLowerCase().includes(q) ||
          p.name.ar.toLowerCase().includes(q) ||
          p.ref.toLowerCase().includes(q),
      )
    }

    const sorted = [...list]
    if (sort === 'priceAsc') {
      sorted.sort(
        (a, b) => (a.promoPrice ?? a.price) - (b.promoPrice ?? b.price),
      )
    } else if (sort === 'priceDesc') {
      sorted.sort(
        (a, b) => (b.promoPrice ?? b.price) - (a.promoPrice ?? a.price),
      )
    } else {
      sorted.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    }
    return sorted
  }, [products, categories, category, onlyPromo, search, sort])

  const isFiltered =
    search !== '' || category !== 'all' || sort !== 'newest' || onlyPromo

  const reset = () => {
    setSearch('')
    setCategory('all')
    setSort('newest')
    setOnlyPromo(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-10 lg:px-8">
  <header className="mb-4 sm:mb-8">
    <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
      {t('products.title')}
    </h1>
  </header>

  <div className="grid gap-4 lg:grid-cols-[240px_1fr] lg:gap-8">
    <aside className="flex items-end gap-2 lg:sticky lg:top-20 lg:block lg:h-fit lg:space-y-6">
      <div className="hidden items-center gap-2 text-sm font-semibold text-foreground lg:flex">
        <SlidersHorizontal className="size-4" />
        {t('products.filters')}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <Label className="sr-only text-xs uppercase tracking-wide text-muted-foreground lg:not-sr-only">
          {t('nav.categories')}
        </Label>
        <Select value={category} onValueChange={(value) => setCategory(value ?? 'all')}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('categories.all')}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {tf(c.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <Label className="sr-only text-xs uppercase tracking-wide text-muted-foreground lg:not-sr-only">
          {t('products.sort')}
        </Label>
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('products.sort.newest')}</SelectItem>
            <SelectItem value="priceAsc">{t('products.sort.priceAsc')}</SelectItem>
            <SelectItem value="priceDesc">{t('products.sort.priceDesc')}</SelectItem>
            <SelectItem value="promo">{t('products.promo')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isFiltered && (
        <Button variant="ghost" size="icon" onClick={reset} aria-label={t('products.clear')} className="shrink-0 lg:hidden">
          <X className="size-7 " />
        </Button>
      )}
      {isFiltered && (
        <Button variant="ghost" size="sm" onClick={reset} className="hidden gap-1.5 lg:inline-flex">
          <X className="size-7 " />
          {t('products.clear')}
        </Button>
      )}
    </aside>

        <div>
          <p className="mb-5 text-sm text-muted-foreground">
            {filtered.length} {t('products.count')}
          </p>
          {filtered.length === 0 ? (
            <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">{t('products.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
