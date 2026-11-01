'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { useStore } from '@/components/providers/store-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SettingsManager() {
  const { t } = useLanguage()
  const { settings, updateSettings } = useStore()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    storeName: settings.storeName,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    whatsapp: settings.whatsapp,
    deliveryFee: String(settings.deliveryFee),
    freeDeliveryThreshold: String(settings.freeDeliveryThreshold ?? 0),
  })

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const deliveryFee = Number(form.deliveryFee)
    const freeDeliveryThreshold = Number(form.freeDeliveryThreshold)
    if (!form.storeName.trim() || !Number.isFinite(deliveryFee) || deliveryFee < 0 ||
      !Number.isFinite(freeDeliveryThreshold) || freeDeliveryThreshold < 0) {
      toast.error(t('checkout.required'))
      return
    }
    setSaving(true)
    try {
      await updateSettings({
        storeName: form.storeName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        whatsapp: form.whatsapp.trim(),
        deliveryFee,
        freeDeliveryThreshold,
      })
      toast.success(t('admin.settings.saved'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible d’enregistrer les paramètres.')
    } finally {
      setSaving(false)
    }
  }

  const fields: {
    key: keyof typeof form
    label: string
    type?: string
  }[] = [
    { key: 'storeName', label: t('admin.settings.storeName') },
    { key: 'phone', label: t('admin.settings.phone') },
    { key: 'email', label: t('admin.settings.email'), type: 'email' },
    { key: 'address', label: t('admin.settings.address') },
    { key: 'whatsapp', label: t('admin.settings.whatsapp') },
    {
      key: 'deliveryFee',
      label: t('admin.settings.deliveryFee'),
      type: 'number',
    },
    {
      key: 'freeDeliveryThreshold',
      label: t('admin.settings.freeThreshold'),
      type: 'number',
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          {t('admin.settings.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('admin.settings.subtitle')}
        </p>
      </header>

      <form
        onSubmit={handleSave}
        className="max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.key}
              className={
                field.key === 'storeName' || field.key === 'address'
                  ? 'space-y-2 sm:col-span-2'
                  : 'space-y-2'
              }
            >
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type={field.type ?? 'text'}
                value={form[field.key]}
                onChange={set(field.key)}
              />
            </div>
          ))}
        </div>
        <Button type="submit" disabled={saving}>{t('admin.settings.save')}</Button>
      </form>
    </div>
  )
}
