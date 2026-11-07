import type React from 'react'
import type { Metadata } from 'next'
import { Cairo, Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Suspense } from 'react'
import { AppProviders } from '@/components/providers/app-providers'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

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
  title: 'Espace Baya — Meubles & Art de vivre',
  description:
    "Espace Baya, votre boutique de meubles et articles pour la maison en Tunisie. Tables de salon, bureaux, salons, chaises et rangement — élégance et qualité au meilleur prix.",
  
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
        <AppProviders>
          <Suspense fallback={null}>{children}</Suspense>
        </AppProviders>
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
