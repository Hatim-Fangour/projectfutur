import type { Metadata } from 'next'
import InventoryPageClient from './InventoryPageClient'

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Manage spa products and supplies. Track stock levels, reorder points, and supplier information.',
}

export default function InventoryPage() {
  return <InventoryPageClient />
}
