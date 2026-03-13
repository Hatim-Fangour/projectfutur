import type { Metadata } from 'next'
import FinancePageClient from './FinancePageClient'

export const metadata: Metadata = {
  title: 'Finance Management',
  description: 'Track income, expenses, and profit. Manage financial transactions for your spa business.',
}

export default function FinanceManagementPage() {
  return <FinancePageClient />
}
