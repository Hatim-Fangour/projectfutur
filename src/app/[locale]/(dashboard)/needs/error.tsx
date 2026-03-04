'use client'

import LuxuryError from '@/components/ui/luxury-error'

export default function InventoryError({
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
      title="Failed to load inventory"
      description="We could not load the inventory items. Please check your connection and try again."
    />
  )
}
