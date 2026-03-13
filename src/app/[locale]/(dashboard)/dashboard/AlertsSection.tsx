'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { StatCard } from '@/components/ui/stat-card'
import { SkeletonStatCards } from '@/components/ui/skeleton-luxury'
import { SkeletonLuxury } from '@/components/ui/skeleton-luxury'
import { LuxuryBadge, statusToVariant } from '@/components/ui/luxury-badge'
import { useEffect, useState } from 'react'
import { dashboardApi, inventoryApi } from '@/lib/api-client'
import { AlertTriangle, Clock, CalendarCheck } from 'lucide-react'

interface UpcomingAppointment {
  id: string
  startTime: string
  endTime: string
  status: string
  service: string | null
  customer: { id: string; fullName: string; pictureURL: string | null }
  therapist: { id: string; fullName: string } | null
}

interface DashboardData {
  customers: { total: number; newThisMonth: number }
  appointments: { today: number; thisMonth: number; upcoming: UpcomingAppointment[] }
  finance: { income: number; expenses: number; profit: number }
  notifications: { unreadCount: number }
  inventory: { lowStockCount: number }
}

interface InventorySummary {
  total: number
  inStock: number
  lowStock: number
  outOfStock: number
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const AlertsSection = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, invRes] = await Promise.all([
          dashboardApi.getOverview(true),
          inventoryApi.summary(),
        ])
        if (dashRes.success && dashRes.data) setData(dashRes.data as DashboardData)
        if (invRes.success && invRes.data) setInventorySummary(invRes.data as InventorySummary)
      } catch {
        // handled by error boundary
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonStatCards count={3} />
        <GlassCard>
          <SkeletonLuxury className="h-5 w-40 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <SkeletonLuxury className="h-4 w-32" />
              <SkeletonLuxury className="h-4 w-20" />
            </div>
          ))}
        </GlassCard>
      </div>
    )
  }

  const upcomingAppointments = data?.appointments.upcoming ?? []

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <StatCard
          label="Today's Bookings"
          value={data?.appointments.today ?? 0}
          trend={`${data?.appointments.thisMonth ?? 0} this month`}
          icon={CalendarCheck}
        />
        <StatCard
          label="Unread Notifications"
          value={data?.notifications.unreadCount ?? 0}
          trend="Pending review"
          icon={Clock}
        />
        <StatCard
          label="Inventory Alerts"
          value={inventorySummary ? inventorySummary.lowStock + inventorySummary.outOfStock : 0}
          trend={inventorySummary?.outOfStock ? `${inventorySummary.outOfStock} out of stock` : 'All items stocked'}
          trendPositive={!inventorySummary?.outOfStock}
          icon={AlertTriangle}
        />
      </div>

      {/* Upcoming Appointments */}
      <GlassCard hover className="animate-fade-in-up">
        <h3 className="text-base font-semibold mb-1">Upcoming Appointments</h3>
        <p className="text-sm text-muted-foreground mb-4">Next scheduled appointments</p>
        {upcomingAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No upcoming appointments</p>
        ) : (
          <ul className="space-y-3">
            {upcomingAppointments.map((apt) => (
              <li key={apt.id} className="flex items-center justify-between text-sm py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-dark to-gold-light flex items-center justify-center text-xs font-semibold text-white">
                    {apt.customer.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{apt.customer.fullName}</p>
                    <p className="text-xs text-muted-foreground">{apt.service ?? 'General'}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-muted-foreground">{formatTime(apt.startTime)} - {formatTime(apt.endTime)}</p>
                    {apt.therapist && <p className="text-xs text-muted-foreground">{apt.therapist.fullName}</p>}
                  </div>
                  <LuxuryBadge variant={statusToVariant(apt.status)}>
                    {apt.status.replace(/_/g, ' ')}
                  </LuxuryBadge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}

export default AlertsSection
