'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { AlertTriangle } from 'lucide-react'

interface LuxuryErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
}

/**
 * Premium error boundary component with gold accents and glass card styling.
 * Used as the error.tsx export for every page route.
 */
export default function LuxuryError({
  error,
  reset,
  title = 'Something went wrong',
  description = 'An unexpected error occurred while loading this page. Please try again.',
}: LuxuryErrorProps) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div role="alert" className="flex items-center justify-center min-h-[60vh] p-6 animate-fade-in-up">
      <GlassCard className="max-w-md w-full text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/20">
          <AlertTriangle aria-hidden="true" className="h-7 w-7 text-rose-500" />
        </div>
        <h2
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={reset} className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-white hover:shadow-gold">
          Try again
        </Button>
      </GlassCard>
    </div>
  )
}
