'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, Views, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import './style/calendarStyle.scss'
import CustomToolbar from '@/app/[locale]/(dashboard)/calendar/calendarComps/CustomToolbar'
import CustomEvent from '@/app/[locale]/(dashboard)/calendar/calendarComps/CustomEvent'
import { Calendar1, Clock, Loader2, Plus, User } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
// Card removed — sidebar uses inline popover now
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { appointmentApi, customerApi, staffApi } from '@/lib/api-client'
import { useRealtime } from '@/providers/RealtimeProvider'
import { toast } from 'sonner'

// ===================================================
// Types
// ===================================================

interface ApiAppointment {
  id: string
  customerId: string
  therapistId: string | null
  type: 'SERVICE' | 'CLASS' | 'EVENT' | 'REMINDER'
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  service: string | null
  reason: string | null
  location: string | null
  notes: string | null
  paymentStatus: string | null
  paymentAmount: string | null
  createdAt: string
  customer: { id: string; fullName: string; email: string | null; phone: string | null; pictureURL: string | null }
  therapist: { id: string; fullName: string; pictureURL: string | null } | null
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  type: string
  status: string
  resource?: ApiAppointment
}

interface CustomerOption {
  id: string
  fullName: string
}

interface StaffOption {
  id: string
  fullName: string
}

interface AppointmentFormData {
  customerId: string
  therapistId: string
  type: 'SERVICE' | 'CLASS' | 'EVENT' | 'REMINDER'
  startDate: string
  startTimeStr: string
  endDate: string
  endTimeStr: string
  service: string
  reason: string
  location: string
  notes: string
}

const emptyForm: AppointmentFormData = {
  customerId: '',
  therapistId: '',
  type: 'SERVICE',
  startDate: '',
  startTimeStr: '',
  endDate: '',
  endTimeStr: '',
  service: '',
  reason: '',
  location: '',
  notes: '',
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
}

// ===================================================
// Calendar Setup
// ===================================================

const DragAndDropCalendar = withDragAndDrop(Calendar)
const localizer = momentLocalizer(moment)

// ===================================================
// Helper: convert an API appointment to a calendar event
// ===================================================

function toCalendarEvent(apt: ApiAppointment): CalendarEvent {
  const title = apt.service || apt.reason || `${apt.type} - ${apt.customer.fullName}`
  return {
    id: apt.id,
    title,
    start: new Date(apt.startTime),
    end: new Date(apt.endTime),
    type: apt.type.toLowerCase(),
    status: apt.status,
    resource: apt,
  }
}

// ===================================================
// Helper: date range for calendar view
// ===================================================

function getViewDateRange(date: Date, view: string): { start: string; end: string } {
  const d = moment(date)
  switch (view) {
    case 'day':
      return {
        start: d.startOf('day').toISOString(),
        end: d.endOf('day').toISOString(),
      }
    case 'week':
      return {
        start: d.startOf('week').toISOString(),
        end: d.endOf('week').toISOString(),
      }
    case 'agenda':
      return {
        start: d.startOf('day').toISOString(),
        end: d.clone().add(30, 'days').endOf('day').toISOString(),
      }
    case 'month':
    default:
      return {
        start: d.clone().startOf('month').subtract(7, 'days').toISOString(),
        end: d.clone().endOf('month').add(7, 'days').toISOString(),
      }
  }
}

// ===================================================
// Helper: format time for sidebar display
// ===================================================

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatLocalTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

// ===================================================
// Sidebar Filter
// ===================================================

type SidebarFilter = 'today' | 'tomorrow' | 'week' | 'month'

function getSidebarAppointments(appointments: ApiAppointment[], filter: SidebarFilter): ApiAppointment[] {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return appointments.filter((apt) => {
    const aptDate = new Date(apt.startTime)
    switch (filter) {
      case 'today':
        return aptDate >= startOfDay && aptDate < new Date(startOfDay.getTime() + 86400000)
      case 'tomorrow': {
        const tomorrow = new Date(startOfDay.getTime() + 86400000)
        return aptDate >= tomorrow && aptDate < new Date(tomorrow.getTime() + 86400000)
      }
      case 'week': {
        const weekEnd = new Date(startOfDay.getTime() + 7 * 86400000)
        return aptDate >= startOfDay && aptDate < weekEnd
      }
      case 'month': {
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        return aptDate >= startOfDay && aptDate <= monthEnd
      }
      default:
        return true
    }
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
}

// ===================================================
// Component
// ===================================================

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<ApiAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<string>('month')
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>('today')

  // Popover state (for clicking on events)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<ApiAppointment | null>(null)
  const [formData, setFormData] = useState<AppointmentFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingAppointment, setDeletingAppointment] = useState<ApiAppointment | null>(null)

  // Customers and staff for dropdowns
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffOption[]>([])

  // ===================================================
  // Data Fetching
  // ===================================================

  const fetchAppointments = useCallback(async (date: Date, view: string) => {
    try {
      setLoading(true)
      const range = getViewDateRange(date, view)
      const res = await appointmentApi.list({
        start: range.start,
        end: range.end,
        limit: 100,
      })
      if (res.success && res.data) {
        setAppointments(res.data as ApiAppointment[])
      } else {
        toast.error(res.error ?? 'Failed to load appointments')
      }
    } catch {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDropdownData = useCallback(async () => {
    try {
      const [custRes, staffRes] = await Promise.all([
        customerApi.list({ limit: 100 }),
        staffApi.list({ limit: 100, role: 'THERAPIST' }),
      ])
      if (custRes.success && custRes.data) {
        setCustomers((custRes.data as CustomerOption[]).map((c) => ({ id: c.id, fullName: c.fullName })))
      }
      if (staffRes.success && staffRes.data) {
        setStaffMembers((staffRes.data as StaffOption[]).map((s) => ({ id: s.id, fullName: s.fullName })))
      }
    } catch {
      /* dropdown data is non-critical */
    }
  }, [])

  useEffect(() => {
    fetchAppointments(currentDate, currentView)
    fetchDropdownData()
  }, [fetchAppointments, fetchDropdownData, currentDate, currentView])

  // ===================================================
  // Realtime: refetch on appointment changes from other users
  // ===================================================

  const { onAppointmentChange } = useRealtime()

  useEffect(() => {
    const unsubscribe = onAppointmentChange(() => {
      // Silently refetch without showing loading spinner
      const range = getViewDateRange(currentDate, currentView)
      appointmentApi
        .list({ start: range.start, end: range.end, limit: 100 })
        .then((res) => {
          if (res.success && res.data) {
            setAppointments(res.data as ApiAppointment[])
          }
        })
        .catch(() => {
          /* silently fail on realtime refetch */
        })
    })
    return unsubscribe
  }, [onAppointmentChange, currentDate, currentView])

  // ===================================================
  // Calendar Events
  // ===================================================

  const calendarEvents = useMemo(() => appointments.map(toCalendarEvent), [appointments])

  const sidebarAppointments = useMemo(
    () => getSidebarAppointments(appointments, sidebarFilter),
    [appointments, sidebarFilter]
  )

  // ===================================================
  // Calendar Event Handlers
  // ===================================================

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  const handleViewChange = useCallback((view: string) => {
    setCurrentView(view)
  }, [])

  const moveEvent = useCallback(
    async ({ event, start, end }: { event: CalendarEvent; start: Date | string; end: Date | string }) => {
      const startDate = start instanceof Date ? start : new Date(start)
      const endDate = end instanceof Date ? end : new Date(end)

      // Optimistic update
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === event.id
            ? { ...apt, startTime: startDate.toISOString(), endTime: endDate.toISOString() }
            : apt
        )
      )

      try {
        const res = await appointmentApi.update(event.id, {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        })
        if (res.success) {
          toast.success('Appointment rescheduled')
        } else {
          toast.error(res.error ?? 'Failed to reschedule')
          fetchAppointments(currentDate, currentView)
        }
      } catch {
        toast.error('Failed to reschedule appointment')
        fetchAppointments(currentDate, currentView)
      }
    },
    [currentDate, currentView, fetchAppointments]
  )

  const resizeEvent = useCallback(
    async ({ event, start, end }: { event: CalendarEvent; start: Date | string; end: Date | string }) => {
      const startDate = start instanceof Date ? start : new Date(start)
      const endDate = end instanceof Date ? end : new Date(end)

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === event.id
            ? { ...apt, startTime: startDate.toISOString(), endTime: endDate.toISOString() }
            : apt
        )
      )

      try {
        const res = await appointmentApi.update(event.id, {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        })
        if (res.success) {
          toast.success('Appointment updated')
        } else {
          toast.error(res.error ?? 'Failed to update')
          fetchAppointments(currentDate, currentView)
        }
      } catch {
        toast.error('Failed to update appointment')
        fetchAppointments(currentDate, currentView)
      }
    },
    [currentDate, currentView, fetchAppointments]
  )

  const handleSelectEvent = useCallback((event: CalendarEvent, e: React.SyntheticEvent) => {
    const mouseEvent = e as unknown as MouseEvent
    setSelectedEvent(event)
    setPopoverPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY })
    setPopoverOpen(true)
  }, [])

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setEditingAppointment(null)
      setFormData({
        ...emptyForm,
        startDate: formatLocalDate(start),
        startTimeStr: formatLocalTime(start),
        endDate: formatLocalDate(end),
        endTimeStr: formatLocalTime(end),
      })
      setDialogOpen(true)
    },
    []
  )

  // ===================================================
  // Event styling
  // ===================================================

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const type = event.type
    if (type === 'service') return { className: 'serviceEvent' }
    if (type === 'class') return { className: 'classEvent' }
    if (type === 'reminder') return { className: 'reminderEvent' }
    if (type === 'event') return { className: 'eventEvent' }
    return {}
  }, [])

  // Listen for create event from toolbar's + button
  useEffect(() => {
    const handler = () => openCreate()
    window.addEventListener('calendar:create', handler)
    return () => window.removeEventListener('calendar:create', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ===================================================
  // CRUD Handlers
  // ===================================================

  const openCreate = () => {
    setEditingAppointment(null)
    const now = new Date()
    const start = new Date(now.getTime() + 15 * 60000)
    start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0)
    const end = new Date(start.getTime() + 60 * 60000)

    setFormData({
      ...emptyForm,
      startDate: formatLocalDate(start),
      startTimeStr: formatLocalTime(start),
      endDate: formatLocalDate(end),
      endTimeStr: formatLocalTime(end),
    })
    setDialogOpen(true)
  }

  const openEdit = (apt: ApiAppointment) => {
    setEditingAppointment(apt)
    const start = new Date(apt.startTime)
    const end = new Date(apt.endTime)
    setFormData({
      customerId: apt.customerId,
      therapistId: apt.therapistId ?? '',
      type: apt.type,
      startDate: formatLocalDate(start),
      startTimeStr: formatLocalTime(start),
      endDate: formatLocalDate(end),
      endTimeStr: formatLocalTime(end),
      service: apt.service ?? '',
      reason: apt.reason ?? '',
      location: apt.location ?? '',
      notes: apt.notes ?? '',
    })
    setDialogOpen(true)
  }

  const openDelete = (apt: ApiAppointment) => {
    setDeletingAppointment(apt)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.customerId && !editingAppointment) {
      toast.error('Select a customer')
      return
    }
    if (!formData.startDate || !formData.startTimeStr) {
      toast.error('Start date and time are required')
      return
    }
    if (!formData.endDate || !formData.endTimeStr) {
      toast.error('End date and time are required')
      return
    }

    const startTime = new Date(`${formData.startDate}T${formData.startTimeStr}:00`).toISOString()
    const endTime = new Date(`${formData.endDate}T${formData.endTimeStr}:00`).toISOString()

    if (new Date(endTime) <= new Date(startTime)) {
      toast.error('End time must be after start time')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        customerId: formData.customerId || undefined,
        therapistId: formData.therapistId || null,
        type: formData.type,
        startTime,
        endTime,
        service: formData.service.trim() || null,
        reason: formData.reason.trim() || null,
        location: formData.location.trim() || null,
        notes: formData.notes.trim() || null,
      }

      if (editingAppointment) {
        const res = await appointmentApi.update(editingAppointment.id, payload)
        if (res.success) {
          toast.success('Appointment updated')
          setDialogOpen(false)
          fetchAppointments(currentDate, currentView)
        } else {
          toast.error(res.error ?? 'Failed to update appointment')
        }
      } else {
        const res = await appointmentApi.create(payload)
        if (res.success) {
          toast.success('Appointment created')
          setDialogOpen(false)
          fetchAppointments(currentDate, currentView)
        } else {
          toast.error(res.error ?? 'Failed to create appointment')
        }
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingAppointment) return
    setSubmitting(true)
    try {
      const res = await appointmentApi.delete(deletingAppointment.id)
      if (res.success) {
        toast.success('Appointment deleted')
        setDeleteDialogOpen(false)
        fetchAppointments(currentDate, currentView)
      } else {
        toast.error(res.error ?? 'Failed to delete appointment')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  // ===================================================
  // Render
  // ===================================================

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-95px)]">
      {/* Event Detail Popover */}
      {selectedEvent?.resource && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div style={{ display: 'none' }} />
          </PopoverTrigger>
          <PopoverContent
            className="w-80"
            style={{
              position: 'fixed',
              top: popoverPosition.y,
              left: popoverPosition.x,
            }}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">
                    {selectedEvent.resource.service || selectedEvent.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedEvent.resource.customer.fullName}
                  </p>
                </div>
                <Badge className={STATUS_COLORS[selectedEvent.resource.status] ?? ''}>
                  {selectedEvent.resource.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar1 className="h-3 w-3 text-muted-foreground" />
                  <span>{formatDateShort(selectedEvent.resource.startTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>
                    {formatTime(selectedEvent.resource.startTime)} -{' '}
                    {formatTime(selectedEvent.resource.endTime)}
                  </span>
                </div>
                {selectedEvent.resource.therapist && (
                  <div className="flex items-center gap-2 col-span-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>{selectedEvent.resource.therapist.fullName}</span>
                  </div>
                )}
                {selectedEvent.resource.location && (
                  <div className="col-span-2 text-muted-foreground">
                    Location: {selectedEvent.resource.location}
                  </div>
                )}
              </div>

              {selectedEvent.resource.notes && (
                <p className="text-xs text-muted-foreground border-t pt-2">
                  {selectedEvent.resource.notes}
                </p>
              )}

              <div className="flex justify-end gap-1 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPopoverOpen(false)
                    openEdit(selectedEvent.resource!)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setPopoverOpen(false)
                    openDelete(selectedEvent.resource!)
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Body */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 flex-1 gap-3 min-h-0">
        {/* Sidebar */}
        <div
          className="lg:col-span-3 xl:col-span-2 rounded-xl overflow-hidden flex flex-col shrink-0 bg-card border border-border"
          style={{ height: 'auto', maxHeight: '200px' }}
        >
          {/* Sidebar header */}
          <div className="px-3 py-2.5 flex items-center gap-2 border-b border-border">
            <Select
              value={sidebarFilter}
              onValueChange={(v) => setSidebarFilter(v as SidebarFilter)}
            >
              <SelectTrigger className="flex-1 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              size="icon"
              className="h-8 w-8 shrink-0 bg-[#C9A84C] hover:bg-[#dbb960] text-white dark:text-[#0a0a0f]"
              onClick={openCreate}
              aria-label="New appointment"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar list */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-2">
              {loading && appointments.length === 0 ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : sidebarAppointments.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar1 className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    No appointments {sidebarFilter === 'today' ? 'today' : `for ${sidebarFilter}`}
                  </p>
                </div>
              ) : (
                sidebarAppointments.map((apt) => (
                  <Popover key={apt.id}>
                    <PopoverTrigger asChild>
                      <button
                        className="w-full mb-1.5 p-2.5 rounded-lg text-left transition-all duration-200 hover:scale-[1.01] bg-muted/30 border border-border hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-1 h-8 rounded-full shrink-0"
                            style={{
                              background:
                                apt.type === 'SERVICE' ? '#C9A84C'
                                : apt.type === 'CLASS' ? '#2dd4bf'
                                : apt.type === 'EVENT' ? '#8b5cf6'
                                : '#fbbf24',
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate text-foreground">
                              {apt.service || apt.reason || apt.type}
                            </p>
                            <p className="text-[11px] truncate text-muted-foreground">
                              {formatTime(apt.startTime)} &middot; {apt.customer.fullName}
                            </p>
                          </div>
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0" side="right" sideOffset={8}>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {apt.service || apt.reason || apt.type}
                            </h4>
                            <p className="text-xs text-muted-foreground">{apt.customer.fullName}</p>
                          </div>
                          <Badge className={`${STATUS_COLORS[apt.status] ?? ''} text-[10px] shrink-0`}>
                            {apt.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar1 className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDateShort(apt.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {Math.round(
                                (new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime()) / 60000
                              )} min
                            </span>
                          </div>
                          {apt.therapist && (
                            <div className="flex items-center gap-1.5 col-span-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span>{apt.therapist.fullName}</span>
                            </div>
                          )}
                        </div>

                        {apt.notes && (
                          <p className="text-xs text-muted-foreground border-t pt-2">{apt.notes}</p>
                        )}

                        <div className="flex justify-end gap-1.5 pt-1">
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEdit(apt)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => openDelete(apt)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Sidebar height override for large screens */}
        <style>{`
          @media (min-width: 1024px) {
            .lg\\:col-span-3 { max-height: none !important; height: 100% !important; }
          }
        `}</style>

        {/* Calendar */}
        <div
          className="calendarPageBody lg:col-span-9 xl:col-span-10 flex-1 min-h-0 rounded-xl overflow-hidden bg-card border border-border p-1 relative"
          style={{ height: '100%', width: '100%' }}
        >
          <div className={`calendar-container h-full ${currentView}-view`}>
            <DragAndDropCalendar
              defaultView={Views.MONTH}
              date={currentDate}
              view={currentView as 'month' | 'week' | 'day' | 'agenda'}
              events={calendarEvents}
              localizer={localizer}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              onEventDrop={moveEvent as (...args: unknown[]) => void}
              onEventResize={resizeEvent as (...args: unknown[]) => void}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={(event, e) => {
                handleSelectEvent(event as CalendarEvent, e)
              }}
              popup
              resizable
              selectable
              formats={{
                timeGutterFormat: (date: Date, culture: string | undefined, loc?: { format: (d: Date, f: string, c: string | undefined) => string }) =>
                  loc ? loc.format(date, 'h a', culture) : '',
              }}
              eventPropGetter={eventPropGetter as (...args: unknown[]) => Record<string, unknown>}
              step={15}
              timeslots={4}
              components={{
                toolbar: CustomToolbar,
                event: CustomEvent,
              }}
            />
          </div>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
            <DialogDescription>
              {editingAppointment
                ? 'Update appointment details.'
                : 'Create a new appointment.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Customer */}
            {!editingAppointment && (
              <div className="grid gap-2">
                <Label>Customer *</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(v) => setFormData((p) => ({ ...p, customerId: v }))}
                  disabled={submitting}
                >
                  <SelectTrigger aria-label="Customer">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Therapist */}
            <div className="grid gap-2">
              <Label>Therapist</Label>
              <Select
                value={formData.therapistId || 'none'}
                onValueChange={(v) => setFormData((p) => ({ ...p, therapistId: v === 'none' ? '' : v }))}
                disabled={submitting}
              >
                <SelectTrigger aria-label="Therapist">
                  <SelectValue placeholder="Select a therapist (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No therapist</SelectItem>
                  {staffMembers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, type: v as AppointmentFormData['type'] }))
                }
                disabled={submitting}
              >
                <SelectTrigger aria-label="Appointment type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SERVICE">Service</SelectItem>
                  <SelectItem value="CLASS">Class</SelectItem>
                  <SelectItem value="EVENT">Event</SelectItem>
                  <SelectItem value="REMINDER">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date/Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTimeStr}
                  onChange={(e) => setFormData((p) => ({ ...p, startTimeStr: e.target.value }))}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTimeStr}
                  onChange={(e) => setFormData((p) => ({ ...p, endTimeStr: e.target.value }))}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Service */}
            <div className="grid gap-2">
              <Label htmlFor="service">Service Name</Label>
              <Input
                id="service"
                value={formData.service}
                onChange={(e) => setFormData((p) => ({ ...p, service: e.target.value }))}
                disabled={submitting}
                placeholder="e.g. Full Body Massage"
              />
            </div>

            {/* Reason & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                disabled={submitting}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingAppointment ? 'Save Changes' : 'Create Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment
              {deletingAppointment?.service ? ` for "${deletingAppointment.service}"` : ''}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
