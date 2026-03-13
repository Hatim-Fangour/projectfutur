import { cn } from '@/lib/utils'
import { type HTMLAttributes, forwardRef } from 'react'

type LuxuryBadgeVariant =
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'in-progress'
  | 'no-show'
  | 'active'
  | 'inactive'
  | 'income'
  | 'expense'
  | 'low-stock'
  | 'out-of-stock'
  | 'in-stock'
  | 'default'

interface LuxuryBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: LuxuryBadgeVariant
}

const variantStyles: Record<LuxuryBadgeVariant, string> = {
  confirmed:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  pending:      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  cancelled:    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  completed:    'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  'in-progress':'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  'no-show':    'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  active:       'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  inactive:     'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  income:       'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  expense:      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  'low-stock':  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'out-of-stock':'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  'in-stock':   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  default:      'bg-gold/10 text-gold-dark dark:text-gold-light border-gold/20',
}

/**
 * Status badges with glow-like background, pill shape,
 * and matching text/border color for a luxury feel.
 */
const LuxuryBadge = forwardRef<HTMLSpanElement, LuxuryBadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5',
          'text-xs font-semibold border',
          'transition-colors duration-200',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

LuxuryBadge.displayName = 'LuxuryBadge'

/**
 * Helper to convert a status string (e.g. "CONFIRMED", "IN_PROGRESS")
 * to the corresponding LuxuryBadge variant.
 */
function statusToVariant(status: string): LuxuryBadgeVariant {
  const map: Record<string, LuxuryBadgeVariant> = {
    SCHEDULED: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no-show',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    INCOME: 'income',
    EXPENSE: 'expense',
    IN_STOCK: 'in-stock',
    LOW_STOCK: 'low-stock',
    OUT_OF_STOCK: 'out-of-stock',
  }
  return map[status] ?? 'default'
}

export { LuxuryBadge, statusToVariant }
export type { LuxuryBadgeProps, LuxuryBadgeVariant }
