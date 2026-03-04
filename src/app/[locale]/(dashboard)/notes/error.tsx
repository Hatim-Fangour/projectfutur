'use client'

import LuxuryError from '@/components/ui/luxury-error'

export default function NotesError({
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
      title="Failed to load notes"
      description="We could not load the notes. Please check your connection and try again."
    />
  )
}
