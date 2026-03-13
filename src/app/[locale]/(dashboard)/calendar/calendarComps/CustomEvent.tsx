import React from 'react'

const CustomEvent = ({ event }: any) => {
  return (
    <div className="h-full flex flex-col overflow-hidden py-px px-0.5 leading-tight">
      <span className="text-xs font-semibold text-[var(--cal-text)] truncate">
        {event.title}
      </span>
      {event.resource?.customer?.fullName && (
        <span className="text-[10px] text-[var(--cal-text-muted)] truncate">
          {event.resource.customer.fullName}
        </span>
      )}
    </div>
  )
}

export default CustomEvent
