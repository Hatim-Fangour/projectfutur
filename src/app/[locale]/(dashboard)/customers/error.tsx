'use client'

import LuxuryError from '@/components/ui/luxury-error'

export default function CustomersError({
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
      title="Failed to load customers"
      description="We could not load the customer list. Please check your connection and try again."
    />
  )
}
