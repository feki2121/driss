import type React from 'react'
import type { Metadata } from 'next'
import { Cairo, Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Suspense } from 'react'
import { AppProviders } from '@/components/providers/app-providers'
import { Toaster } from '@/components/ui/sonner'
import { getSiteUrl } from '@/lib/seo'
import './globals.css'
import MetaPixel from "@/components/MetaPixel";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: 'Espace Baya — Meubles & Art de vivre',
    template: '%s | Espace Baya',
  },
  description:
    'Découvrez une sélection de meubles élégants pour chaque pièce : canapés, tables, chaises, bureaux et rangement chez Espace Baya.',
  keywords: [
    'meubles',
    'mobilier',
    'canapé',
    'tables',
    'chaises',
    'meubles de maison',
    'Espace Baya',
  ],
  openGraph: {
    type: 'website',
    title: 'Espace Baya — Meubles & Art de vivre',
    description:
      'Des meubles élégants et intemporels, sélectionnés avec soin pour votre intérieur.',
    siteName: 'Espace Baya',
    locale: 'fr_FR',
    url: '/',
    images: [
      {
        url: '/products/hero-living.png',
        alt: 'Sélection de meubles Espace Baya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Espace Baya — Meubles & Art de vivre',
    description:
      'Des meubles élégants et intemporels, sélectionnés avec soin pour votre intérieur.',
    images: ['/products/hero-living.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" dir="ltr" className="bg-background">
      <body
        className={`${inter.variable} ${playfair.variable} ${cairo.variable} font-sans antialiased`}
      >
        <MetaPixel />
        <AppProviders>
          <Suspense fallback={null}>{children}</Suspense>
        </AppProviders>
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
