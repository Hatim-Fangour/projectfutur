import type { Metadata } from 'next'
import ResetPasswordClient from './ResetPasswordClient'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your Magic Spa Center account.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
