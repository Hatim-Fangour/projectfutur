import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

type LuxuryButtonVariant = 'gold' | 'outline-gold' | 'ghost-luxury' | 'danger'
type LuxuryButtonSize = 'sm' | 'md' | 'lg'

interface LuxuryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LuxuryButtonVariant
  size?: LuxuryButtonSize
  loading?: boolean
}

const variantStyles: Record<LuxuryButtonVariant, string> = {
  gold: [
    'bg-gradient-to-r from-gold-dark via-gold to-gold-light',
    'text-white font-semibold',
    'hover:from-gold hover:via-gold-light hover:to-gold',
    'hover:shadow-gold',
    'active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2',
  ].join(' '),
  'outline-gold': [
    'border-2 border-gold/40 text-gold',
    'hover:border-gold hover:bg-gold/5',
    'hover:shadow-gold',
    'active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2',
  ].join(' '),
  'ghost-luxury': [
    'text-foreground',
    'hover:bg-gold/5 hover:text-gold',
    'active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2',
  ].join(' '),
  danger: [
    'bg-destructive/10 text-destructive border border-destructive/20',
    'hover:bg-destructive/20 hover:border-destructive/40',
    'active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:ring-offset-2',
  ].join(' '),
}

const sizeStyles: Record<LuxuryButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3 text-base rounded-xl gap-2.5',
}

/**
 * Premium styled button with gold gradient, outline, ghost, and danger variants.
 */
const LuxuryButton = forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  ({ className, variant = 'gold', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

LuxuryButton.displayName = 'LuxuryButton'

export { LuxuryButton }
export type { LuxuryButtonProps }
