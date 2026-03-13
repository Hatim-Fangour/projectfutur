import type { Metadata } from 'next'
import CustomerPageClient from './CustomerPageClient'

export const metadata: Metadata = {
  title: 'Customers',
  description: 'View and manage your spa customer database, profiles, and visit history.',
}

export default function CustomersPage() {
  // Data is fetched client-side via API in CustomerPageClient
  return <CustomerPageClient />
}
