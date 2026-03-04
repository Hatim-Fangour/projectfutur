import { cn } from '@/lib/utils'
import { type HTMLAttributes, type ReactNode, forwardRef } from 'react'

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Page title, displayed in the display font */
  title: string
  /** Optional subtitle in muted color */
  subtitle?: string
  /** Content rendered on the right side (e.g. action buttons) */
  actions?: ReactNode
}

/**
 * Consistent page header with display font title, muted subtitle,
 * right-side action slot, and a thin gold bottom border.
 */
const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, subtitle, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between',
          'pb-4 mb-6 border-b border-gold/20',
          'animate-fade-in',
          className
        )}
        {...props}
      >
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            {actions}
          </div>
        )}
      </div>
    )
  }
)

PageHeader.displayName = 'PageHeader'

export { PageHeader }
export type { PageHeaderProps }
