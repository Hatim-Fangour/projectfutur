'use client'

import LuxuryError from '@/components/ui/luxury-error'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <LuxuryError error={error} reset={reset} />
}
