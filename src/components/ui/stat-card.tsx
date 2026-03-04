'use client'

import { cn } from '@/lib/utils'
import { type HTMLAttributes, forwardRef, useEffect, useRef, useState } from 'react'
import { type LucideIcon } from 'lucide-react'

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /** The KPI label */
  label: string
  /** The numeric or string value to display */
  value: string | number
  /** Optional trend text (e.g. "+12% from last month") */
  trend?: string
  /** Whether the trend is positive */
  trendPositive?: boolean
  /** Lucide icon component */
  icon?: LucideIcon
  /** Optional link destination when clicking the card */
  href?: string
}

/**
 * Animates a number counting up from 0 to the target value.
 * Uses requestAnimationFrame callback to avoid synchronous setState in effect body.
 */
function useCountUp(target: number, duration = 800): number {
  const [count, setCount] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    startRef.current = null

    const step = (timestamp: number) => {
      if (target === 0) { setCount(0); return }
      if (startRef.current === null) startRef.current = timestamp
      const progress = Math.min((timestamp - startRef.current) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) { rafRef.current = requestAnimationFrame(step) }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return count
}

/**
 * KPI display card with icon in a gold gradient circle,
 * animated count-up, label, and optional trend indicator.
 */
const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, value, trend, trendPositive, icon: Icon, ...props }, ref) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value)
    const isNumeric = !isNaN(numericValue) && typeof value === 'number'
    const animatedValue = useCountUp(isNumeric ? numericValue : 0)

    const displayValue = isNumeric ? animatedValue.toLocaleString() : value

    return (
      <div
        ref={ref}
        className={cn(
          'glass-card rounded-xl p-5 gold-border-top',
          'card-hover-lift cursor-default',
          'animate-fade-in-up',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">
              {displayValue}
            </p>
          </div>
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-dark to-gold-light">
              <Icon className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        {trend && (
          <p className={cn(
            'mt-2 text-xs font-medium',
            trendPositive === true && 'text-emerald-600 dark:text-emerald-400',
            trendPositive === false && 'text-red-600 dark:text-red-400',
            trendPositive === undefined && 'text-muted-foreground'
          )}>
            {trendPositive === true && '\u2191 '}
            {trendPositive === false && '\u2193 '}
            {trend}
          </p>
        )}
      </div>
    )
  }
)

StatCard.displayName = 'StatCard'

export { StatCard }
export type { StatCardProps }
