import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tous nos meubles',
  description:
    'Parcourez les meubles Espace Baya : canapés, tables, chaises, bureaux et mobilier pour toute la maison.',
  keywords: ['acheter des meubles', 'catalogue mobilier', 'canapé', 'table', 'chaise'],
  alternates: { canonical: '/produits' },
  openGraph: {
    title: 'Tous nos meubles',
    description:
      'Parcourez les meubles Espace Baya : canapés, tables, chaises, bureaux et mobilier pour toute la maison.',
    url: '/produits',
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
    title: 'Tous nos meubles',
    description:
      'Parcourez les meubles Espace Baya : canapés, tables, chaises, bureaux et mobilier pour toute la maison.',
    images: ['/products/hero-living.png'],
  },
}

export default function ProductsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
