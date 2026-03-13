'use client'

import LuxuryError from '@/components/ui/luxury-error'

export default function CalendarError({
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
      title="Failed to load calendar"
      description="We could not load the appointment calendar. Please check your connection and try again."
    />
  )
}
