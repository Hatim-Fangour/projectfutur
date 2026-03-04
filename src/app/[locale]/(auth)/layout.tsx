import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Authentication',
    template: '%s | Magic Spa Center',
  },
  description: 'Sign in to your Magic Spa Center account to manage your luxury spa business.',
}

/**
 * Auth layout: centered card, no sidebar or navbar.
 * Used for login, register, forgot-password, and reset-password pages.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
