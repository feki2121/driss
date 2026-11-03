'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type Props = {
  value: string[]
  onChange: (images: string[]) => void
  onUploadingChange?: (uploading: boolean) => void
  max?: number
}

export function ImageUploader({ value, onChange, onUploadingChange, max = 20 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const upload = async (files: FileList) => {
    const room = max - value.length
    if (room <= 0) return toast.error(`Maximum ${max} images.`)

    setUploading(true)
    onUploadingChange?.(true)
    const urls: string[] = []
    for (const file of Array.from(files).slice(0, room)) {
      try {
        const body = new FormData()
        body.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body })
        const data = await res.json().catch(() => null)
        if (!res.ok) throw new Error(data?.error || 'Échec du téléversement.')
        urls.push(data.url)
      } catch (error) {
        toast.error(
          `${file.name} : ${error instanceof Error ? error.message : 'Connexion impossible.'}`,
        )
      }
    }
    if (urls.length) onChange([...value, ...urls])
    setUploading(false)
    onUploadingChange?.(false)
    if (inputRef.current) inputRef.current.value = '' // allow re-picking the same file
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => e.target.files && upload(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={uploading || value.length >= max}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        Parcourir
      </Button>

      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {value.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-md border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label="Retirer l’image"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute end-1 top-1 rounded-full bg-background/80 p-1 hover:bg-background"
              >
                <X className="size-3" />
              </button>
              {i === 0 && (
                <span className="absolute inset-x-0 bottom-0 bg-background/80 text-center text-[10px]">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}