import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GKash – Merchant Dashboard',
  description: 'Generate QR codes for payments and track transactions',
}

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
