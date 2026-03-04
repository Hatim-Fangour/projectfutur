'use client'

import LuxuryError from '@/components/ui/luxury-error'

export default function ServicesError({
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
      title="Failed to load services"
      description="We could not load the service catalog. Please check your connection and try again."
    />
  )
}
