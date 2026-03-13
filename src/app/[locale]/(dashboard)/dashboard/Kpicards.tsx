'use client'

import { DollarSign, Calendar, Users, UserCheck, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dashboardApi } from '@/lib/api-client'
import { StatCard } from '@/components/ui/stat-card'
import { SkeletonStatCards } from '@/components/ui/skeleton-luxury'

interface DashboardData {
  customers: { total: number; newThisMonth: number }
  appointments: { today: number; thisMonth: number; upcoming: unknown[] }
  finance: { income: number; expenses: number; profit: number }
  staff: { active: number }
  inventory: { lowStockCount: number }
  notifications: { unreadCount: number }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

const Kpicards = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardApi.getOverview()
        if (res.success && res.data) {
          setData(res.data as DashboardData)
        }
      } catch {
        // Silently fail -- error boundary handles critical errors
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <SkeletonStatCards count={5} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
      <StatCard
        label="Monthly Revenue"
        value={data ? formatCurrency(data.finance.income) : '$0'}
        trend={data ? `Profit: ${formatCurrency(data.finance.profit)}` : ''}
        trendPositive={data ? data.finance.profit >= 0 : true}
        icon={DollarSign}
      />
      <StatCard
        label="Today's Appointments"
        value={data?.appointments.today ?? 0}
        trend={`${data?.appointments.thisMonth ?? 0} this month`}
        trendPositive={true}
        icon={Calendar}
      />
      <StatCard
        label="Total Customers"
        value={data?.customers.total ?? 0}
        trend={`${data?.customers.newThisMonth ?? 0} new this month`}
        trendPositive={(data?.customers.newThisMonth ?? 0) > 0}
        icon={Users}
      />
      <StatCard
        label="Active Staff"
        value={data?.staff.active ?? 0}
        trend="Currently active"
        icon={UserCheck}
      />
      <StatCard
        label="Low Stock Items"
        value={data?.inventory.lowStockCount ?? 0}
        trend={data?.inventory.lowStockCount ? 'Items need attention' : 'All stocked'}
        trendPositive={(data?.inventory.lowStockCount ?? 0) === 0}
        icon={Package}
      />
    </div>
  )
}

export default Kpicards
