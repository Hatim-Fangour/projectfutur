import type { Metadata } from 'next'
import ServicesPageClient from './ServicesPageClient'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Manage your spa service catalog, categories, pricing, and availability.',
}

export default function ServicesPage() {
  return <ServicesPageClient />
}
