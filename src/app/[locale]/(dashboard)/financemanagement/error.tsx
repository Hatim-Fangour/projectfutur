'use client'

import LuxuryError from '@/components/ui/luxury-error'

export default function FinanceManagementError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <LuxuryError
      error={error}
      reset={reset}
      title="Failed to load finance data"
      description="We could not load the financial data. Please check your connection and try again."
    />
  )
}
