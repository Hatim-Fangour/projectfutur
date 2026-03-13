import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
  Grid3x3,
  List,
  Plus,
} from 'lucide-react'
import React from 'react'
import { Views, type View } from 'react-big-calendar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ToolbarProps {
  label: string
  onNavigate: (action: 'PREV' | 'TODAY' | 'NEXT') => void
  onView: (view: View) => void
  view: View
}

const viewOptions = [
  { key: Views.DAY, label: 'Day', icon: CalendarDays },
  { key: Views.WEEK, label: 'Week', icon: CalendarRange },
  { key: Views.MONTH, label: 'Month', icon: Grid3x3 },
  { key: Views.AGENDA, label: 'Agenda', icon: List },
]

const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps) => {
  return (
    <div className="flex items-center justify-between gap-2 px-1 py-2 flex-wrap">
      {/* Navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onNavigate('PREV')}
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs font-medium"
          onClick={() => onNavigate('TODAY')}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onNavigate('NEXT')}
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Date Label */}
      <h2
        className="text-sm sm:text-base font-semibold tracking-tight order-3 sm:order-none w-full sm:w-auto text-center text-foreground"
        aria-live="polite"
      >
        {label}
      </h2>

      {/* View Switcher + Add */}
      <div className="flex items-center gap-1">
        {/* Desktop: inline buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {viewOptions.map((v) => {
            const Icon = v.icon
            const isActive = view === v.key
            return (
              <Button
                key={v.key}
                variant="outline"
                size="sm"
                className={`h-8 px-2.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#C9A84C]/15 border-[#C9A84C]/30 text-[#C9A84C]'
                    : 'text-muted-foreground'
                }`}
                onClick={() => onView(v.key)}
              >
                <Icon className="h-3.5 w-3.5 mr-1" />
                {v.label}
              </Button>
            )
          })}
        </div>

        {/* Mobile: dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="sm:hidden h-8 px-2.5 text-xs"
            >
              {viewOptions.find((v) => v.key === view)?.label ?? 'View'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[120px]">
            {viewOptions.map((v) => {
              const Icon = v.icon
              return (
                <DropdownMenuItem
                  key={v.key}
                  onClick={() => onView(v.key)}
                  className={view === v.key ? 'text-[#C9A84C]' : ''}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {v.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="icon"
          className="h-8 w-8 bg-[#C9A84C] hover:bg-[#dbb960] text-white dark:text-[#0a0a0f]"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('calendar:create'))
          }}
          aria-label="New appointment"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default CustomToolbar
