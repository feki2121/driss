import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirmation de commande',
  robots: { index: false, follow: false },
}

export default function OrderConfirmationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
