'use client'

import Image from 'next/image'
import { Award, Headphones, Truck } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

export function AboutSection() {
  const { t } = useLanguage()

  const points = [
    { icon: Award, title: t('about.point1'), sub: t('about.point1sub') },
    { icon: Truck, title: t('about.point2'), sub: t('about.point2sub') },
    { icon: Headphones, title: t('about.point3'), sub: t('about.point3sub') },
  ]

  return (
    <section id="about" className="bg-secondary">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="/products/showroom.png"
            alt={t('about.title')}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            {t('about.eyebrow')}
          </span>
          <h2 className="mt-3 text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl">
            {t('about.title')}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {t('about.text')}
          </p>

          <div className="mt-8 space-y-5">
            {points.map((p) => (
              <div key={p.title} className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background text-primary">
                  <p.icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
