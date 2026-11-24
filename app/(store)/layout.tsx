import type { Metadata } from 'next'
import { SiteFooter } from '@/components/store/site-footer'
import { SiteHeader } from '@/components/store/site-header'

export const metadata: Metadata = {
  title: 'Meubles élégants pour votre intérieur',
  description:
    'Explorez les collections Espace Baya : des meubles élégants, confortables et sélectionnés avec soin pour la maison.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Meubles élégants pour votre intérieur',
    description:
      'Explorez les collections Espace Baya : des meubles élégants, confortables et sélectionnés avec soin pour la maison.',
    url: '/',
    type: 'website',
    siteName: 'Espace Baya',
    locale: 'fr_FR',
    images: [
      {
        url: '/products/hero-living.png',
        alt: 'Sélection de meubles Espace Baya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meubles élégants pour votre intérieur',
    description:
      'Explorez les collections Espace Baya : des meubles élégants, confortables et sélectionnés avec soin pour la maison.',
    images: ['/products/hero-living.png'],
  },
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
