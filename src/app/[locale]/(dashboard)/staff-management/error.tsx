'use client'

import LuxuryError from '@/components/ui/luxury-error'

export default function StaffManagementError({
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
      title="Failed to load staff management"
      description="We could not load the staff data. Please check your connection and try again."
    />
  )
}
