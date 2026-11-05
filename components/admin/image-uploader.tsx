'use client'

import { useRef, useState } from 'react'
import { Camera, ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type Props = {
  value: string[]
  onChange: (images: string[]) => void
  onUploadingChange?: (uploading: boolean) => void
  max?: number
}
async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file) 
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.fillStyle = '#fff' 
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    )
    if (!blob || blob.size >= file.size) return file 
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file 
  }
}

export function ImageUploader({ value, onChange, onUploadingChange, max = 20 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const single = max === 1

  const upload = async (files: FileList) => {
    const room = single ? 1 : max - value.length
    if (room <= 0) return toast.error(`Maximum ${max} images.`)

    setUploading(true)
    onUploadingChange?.(true)
    const urls: string[] = []
    for (const file of Array.from(files).slice(0, room)) {
      try {
        const body = new FormData()
        body.append('file', await shrink(file))
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
    if (urls.length) onChange(single ? [urls[0]] : [...value, ...urls])
    setUploading(false)
    onUploadingChange?.(false)
    
    if (inputRef.current) inputRef.current.value = ''
    if (cameraRef.current) cameraRef.current.value = ''
  }

  const full = !single && value.length >= max

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={!single}
        hidden
        onChange={(e) => e.target.files && upload(e.target.files)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => e.target.files && upload(e.target.files)}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={uploading || full}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {single && value.length ? 'Changer' : 'Parcourir'}
        </Button>

        {/* phones and tablets only: capture is ignored on desktop */}
        <Button
          type="button"
          variant="outline"
          className="gap-2 md:hidden"
          disabled={uploading || full}
          onClick={() => cameraRef.current?.click()}
        >
          <Camera className="size-4" />
          Prendre une photo
        </Button>
      </div>

      {value.length > 0 && (
        <div className={single ? 'w-32' : 'grid grid-cols-4 gap-2 sm:grid-cols-5'}>
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
              {i === 0 && !single && (
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