import { cn } from '@/lib/utils'
import { type HTMLAttributes, forwardRef } from 'react'

interface SkeletonLuxuryProps extends HTMLAttributes<HTMLDivElement> {
  /** Make the skeleton circular (for avatars) */
  circle?: boolean
}

/**
 * Premium loading skeleton with a gold-tinted shimmer animation.
 * Matches the exact layout of the content it replaces.
 */
const SkeletonLuxury = forwardRef<HTMLDivElement, SkeletonLuxuryProps>(
  ({ className, circle = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-muted/60 luxury-shimmer',
          circle ? 'rounded-full' : 'rounded-lg',
          className
        )}
        {...props}
      />
    )
  }
)

SkeletonLuxury.displayName = 'SkeletonLuxury'

/**
 * Pre-built skeleton layouts for common page patterns.
 */

function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-5 gold-border-top space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SkeletonLuxury className="h-4 w-24" />
              <SkeletonLuxury className="h-7 w-16" />
            </div>
            <SkeletonLuxury className="h-10 w-10" circle />
          </div>
          <SkeletonLuxury className="h-3 w-32" />
        </div>
      ))}
    </div>
  )
}

function SkeletonPageHeader() {
  return (
    <div role="status" aria-label="Loading page header" className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-gold/20">
      <div className="space-y-2">
        <SkeletonLuxury className="h-8 w-48" />
        <SkeletonLuxury className="h-4 w-72" />
      </div>
      <SkeletonLuxury className="h-10 w-32" />
    </div>
  )
}

function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="Loading table" className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gold/10">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <SkeletonLuxury key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonLuxury key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <SkeletonLuxury className="h-10 w-10" circle />
            <div className="flex-1 space-y-1.5">
              <SkeletonLuxury className="h-4 w-3/4" />
              <SkeletonLuxury className="h-3 w-1/2" />
            </div>
          </div>
          <SkeletonLuxury className="h-3 w-full" />
          <SkeletonLuxury className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  )
}

export { SkeletonLuxury, SkeletonStatCards, SkeletonPageHeader, SkeletonTable, SkeletonCards }
export type { SkeletonLuxuryProps }
