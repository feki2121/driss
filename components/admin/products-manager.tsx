'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { useStore } from '@/components/providers/store-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Product } from '@/lib/types'

type FormState = {
  nameFr: string
  nameAr: string
  descFr: string
  descAr: string
  price: string
  promoPrice: string
  categoryId: string
  stock: string
  ref: string
  images: string
  isNew: boolean
  isActive: boolean
}

const emptyForm = (categoryId: string): FormState => ({
  nameFr: '',
  nameAr: '',
  descFr: '',
  descAr: '',
  price: '',
  promoPrice: '',
  categoryId,
  stock: '0',
  ref: '',
  images: '',
  isNew: false,
  isActive: true,
})

export function ProductsManager() {
  const { t, tf, price } = useLanguage()
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useStore()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm(categories[0]?.id ?? ''))

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.fr.toLowerCase().includes(q) ||
        p.name.ar.toLowerCase().includes(q) ||
        p.ref.toLowerCase().includes(q),
    )
  }, [products, search])

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm(categories[0]?.id ?? ''))
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      nameFr: product.name.fr,
      nameAr: product.name.ar,
      descFr: product.description.fr,
      descAr: product.description.ar,
      price: String(product.price),
      promoPrice: product.promoPrice ? String(product.promoPrice) : '',
      categoryId: product.categoryId,
      stock: String(product.stock),
      ref: product.ref,
      images: product.images.join(', '),
      isNew: product.isNew,
      isActive: product.isActive,
    })
    setDialogOpen(true)
  }

  const catName = (id: string) => {
    const c = categories.find((x) => x.id === id)
    return c ? tf(c.name) : '—'
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!form.nameFr.trim() || !form.price) {
      toast.error(t('checkout.required'))
      return
    }
    const images = form.images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const payload = {
      ref: form.ref.trim() || `REF-${Date.now().toString().slice(-5)}`,
      name: { fr: form.nameFr.trim(), ar: form.nameAr.trim() || form.nameFr.trim() },
      description: {
        fr: form.descFr.trim(),
        ar: form.descAr.trim() || form.descFr.trim(),
      },
      price: Number(form.price),
      promoPrice: form.promoPrice ? Number(form.promoPrice) : null,
      images: images.length ? images : ['/placeholder.svg'],
      categoryId: form.categoryId,
      stock: Number(form.stock) || 0,
      isNew: form.isNew,
      isActive: form.isActive,
    }

    setSaving(true)
    try {
      if (editing) await updateProduct(editing.id, payload)
      else await addProduct(payload)
      toast.success(t('admin.settings.saved'))
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible d’enregistrer le produit.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (product: Product) => {
    if (window.confirm(t('admin.products.deleteConfirm'))) {
      void deleteProduct(product.id).then(
        () => toast.success(t('admin.products.delete')),
        (error: unknown) => toast.error(error instanceof Error ? error.message : 'Impossible de supprimer le produit.'),
      )
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {t('admin.products.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('admin.products.subtitle')}
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" />
          {t('admin.products.add')}
        </Button>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.products.search')}
          className="ps-9"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.products.name')}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t('admin.form.category')}
              </TableHead>
              <TableHead>{t('admin.products.price')}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t('admin.products.stock')}
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                {t('admin.products.status')}
              </TableHead>
              <TableHead className="text-end">
                {t('admin.products.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={p.images[0] || '/placeholder.svg'}
                        alt={tf(p.name)}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {tf(p.name)}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.ref}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {catName(p.categoryId)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {price(p.promoPrice ?? p.price)}
                    </span>
                    {p.promoPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {price(p.price)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span
                    className={
                      p.stock <= 0
                        ? 'text-destructive'
                        : p.stock < 5
                          ? 'text-chart-4'
                          : 'text-foreground'
                    }
                  >
                    {p.stock}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {p.isActive ? (
                    <Badge variant="secondary">{t('admin.products.active')}</Badge>
                  ) : (
                    <Badge variant="outline">
                      {t('admin.products.inactive')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(p)}
                      aria-label={t('admin.products.edit')}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p)}
                      aria-label={t('admin.products.delete')}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? t('admin.form.editTitle') : t('admin.form.newTitle')}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nameFr">{t('admin.form.nameFr')}</Label>
              <Input
                id="nameFr"
                value={form.nameFr}
                onChange={(e) => set('nameFr', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameAr">{t('admin.form.nameAr')}</Label>
              <Input
                id="nameAr"
                dir="rtl"
                value={form.nameAr}
                onChange={(e) => set('nameAr', e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descFr">{t('admin.form.descFr')}</Label>
              <Textarea
                id="descFr"
                rows={2}
                value={form.descFr}
                onChange={(e) => set('descFr', e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descAr">{t('admin.form.descAr')}</Label>
              <Textarea
                id="descAr"
                dir="rtl"
                rows={2}
                value={form.descAr}
                onChange={(e) => set('descAr', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">{t('admin.form.price')}</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promoPrice">{t('admin.form.promoPrice')}</Label>
              <Input
                id="promoPrice"
                type="number"
                min="0"
                value={form.promoPrice}
                onChange={(e) => set('promoPrice', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t('admin.form.category')}</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => set('categoryId', v ?? '')}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {tf(c.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">{t('admin.form.stock')}</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref">{t('admin.form.ref')}</Label>
              <Input
                id="ref"
                value={form.ref}
                onChange={(e) => set('ref', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">{t('admin.form.images')}</Label>
              <Input
                id="images"
                value={form.images}
                onChange={(e) => set('images', e.target.value)}
                placeholder="/products/exemple.png"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3 sm:col-span-2">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={form.isNew}
                    onCheckedChange={(v) => set('isNew', v)}
                  />
                  {t('admin.form.isNew')}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => set('isActive', v)}
                  />
                  {t('admin.form.isActive')}
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('admin.form.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>{t('admin.form.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
