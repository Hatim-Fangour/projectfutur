import { cn } from '@/lib/utils'
import { type HTMLAttributes, forwardRef } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Enable lift + glow on hover */
  hover?: boolean
  /** Add subtle gold glow effect */
  glow?: boolean
  /** Add gold top border accent */
  goldBorder?: boolean
}

/**
 * A card with glass morphism effect, gold border, and subtle blur.
 * Used as a premium container throughout the luxury design system.
 */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, glow = false, goldBorder = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-card rounded-xl p-6 transition-all duration-300',
          hover && 'card-hover-lift cursor-pointer',
          glow && 'gold-glow',
          goldBorder && 'gold-border-top',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export { GlassCard }
export type { GlassCardProps }
