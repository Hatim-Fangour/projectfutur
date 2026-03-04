import type { Metadata } from 'next'
import RegisterPageClient from './RegisterPageClient'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a new Magic Spa Center account to get started with spa management.',
}

export default function RegisterPage() {
  return <RegisterPageClient />
}
