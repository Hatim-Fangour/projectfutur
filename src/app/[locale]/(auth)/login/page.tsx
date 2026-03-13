import type { Metadata } from 'next'
import LoginPageClient from './LoginPageClient'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Magic Spa Center account to manage your luxury spa business.',
}

export default function LoginPage() {
  return <LoginPageClient />
}
