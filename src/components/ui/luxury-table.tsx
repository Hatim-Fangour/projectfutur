import { cn } from '@/lib/utils'
import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes, forwardRef } from 'react'

/**
 * A luxury-styled table wrapper that enhances the default table appearance
 * with gold accents, glass card background, row hover effects, and staggered entry.
 *
 * Wraps the standard <table> element; use with LuxuryTableHeader, LuxuryTableBody,
 * LuxuryTableRow, LuxuryTableHead, LuxuryTableCell.
 */

const LuxuryTableWrapper = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'glass-card rounded-xl overflow-hidden animate-fade-in-up',
        className
      )}
      {...props}
    >
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  )
)
LuxuryTableWrapper.displayName = 'LuxuryTableWrapper'

const LuxuryTable = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  )
)
LuxuryTable.displayName = 'LuxuryTable'

const LuxuryTableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        'bg-gradient-to-r from-muted/80 to-muted/40',
        'border-b border-gold/10',
        '[&_tr]:border-b-0',
        className
      )}
      {...props}
    />
  )
)
LuxuryTableHeader.displayName = 'LuxuryTableHeader'

const LuxuryTableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn(
        '[&_tr:last-child]:border-0',
        'stagger-children',
        className
      )}
      {...props}
    />
  )
)
LuxuryTableBody.displayName = 'LuxuryTableBody'

const LuxuryTableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border/50 transition-colors duration-200',
        'hover:bg-gold/[0.03] dark:hover:bg-gold/[0.05]',
        'animate-fade-in',
        className
      )}
      {...props}
    />
  )
)
LuxuryTableRow.displayName = 'LuxuryTableRow'

const LuxuryTableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      scope="col"
      className={cn(
        'h-10 px-4 text-left align-middle font-semibold text-muted-foreground',
        'text-xs uppercase tracking-wider',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
)
LuxuryTableHead.displayName = 'LuxuryTableHead'

const LuxuryTableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'px-4 py-3 align-middle',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
)
LuxuryTableCell.displayName = 'LuxuryTableCell'

const LuxuryTableEmpty = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { message?: string }>(
  ({ className, message = 'No data found', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
      {...props}
    >
      {children || (
        <p className="text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  )
)
LuxuryTableEmpty.displayName = 'LuxuryTableEmpty'

export {
  LuxuryTableWrapper,
  LuxuryTable,
  LuxuryTableHeader,
  LuxuryTableBody,
  LuxuryTableRow,
  LuxuryTableHead,
  LuxuryTableCell,
  LuxuryTableEmpty,
}
