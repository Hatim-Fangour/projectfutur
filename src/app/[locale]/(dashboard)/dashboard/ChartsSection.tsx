'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { SkeletonLuxury } from '@/components/ui/skeleton-luxury'
import { useEffect, useState } from 'react'
import { dashboardApi } from '@/lib/api-client'

interface DashboardData {
  finance: { income: number; expenses: number; profit: number }
  appointments: { today: number; thisMonth: number }
  customers: { total: number; newThisMonth: number }
  staff: { active: number }
  recentActivity?: {
    recentTransactions: Array<{
      id: string
      type: string
      category: string
      amount: string
      date: string
      status: string
    }>
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}

const ChartsSection = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardApi.getOverview(true)
        if (res.success && res.data) {
          setData(res.data as DashboardData)
        }
      } catch {
        // handled by error boundary
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} hover>
            <SkeletonLuxury className="h-5 w-40 mb-4" />
            <SkeletonLuxury className="h-48 w-full" />
          </GlassCard>
        ))}
      </div>
    )
  }

  const income = data?.finance.income ?? 0
  const expenses = data?.finance.expenses ?? 0
  const profit = data?.finance.profit ?? 0
  const total = income + expenses || 1

  const financeBreakdown = [
    { label: 'Income', value: income, percent: Math.round((income / total) * 100), barClass: 'bg-emerald-500' },
    { label: 'Expenses', value: expenses, percent: Math.round((expenses / total) * 100), barClass: 'bg-rose-500' },
    { label: 'Profit', value: profit, percent: Math.round((Math.abs(profit) / total) * 100), barClass: profit >= 0 ? 'bg-sky-500' : 'bg-orange-500' },
  ]

  const recentTransactions = data?.recentActivity?.recentTransactions ?? []

  const categoryMap = new Map<string, { income: number; expense: number }>()
  recentTransactions.forEach((tx) => {
    const existing = categoryMap.get(tx.category) ?? { income: 0, expense: 0 }
    const amount = Number(tx.amount)
    if (tx.type === 'INCOME') existing.income += amount
    else existing.expense += amount
    categoryMap.set(tx.category, existing)
  })

  const categories = Array.from(categoryMap.entries())
    .map(([category, amounts]) => ({
      category,
      total: amounts.income + amounts.expense,
      income: amounts.income,
      expense: amounts.expense,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 7)

  const maxCategoryTotal = Math.max(...categories.map((c) => c.total), 1)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
      {/* Finance Overview */}
      <GlassCard hover className="animate-fade-in-up">
        <h3 className="text-base font-semibold mb-1">Monthly Finance Overview</h3>
        <p className="text-sm text-muted-foreground mb-4">Income, expenses, and profit this month</p>
        <div className="space-y-4">
          {financeBreakdown.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">{item.label}</span>
                <span className="text-muted-foreground">{formatCurrency(item.value)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`${item.barClass} h-full rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(item.percent, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Revenue by Category */}
      <GlassCard hover className="animate-fade-in-up">
        <h3 className="text-base font-semibold mb-1">Revenue by Category</h3>
        <p className="text-sm text-muted-foreground mb-4">Transaction breakdown by category</p>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions this month</p>
        ) : (
          <div className="space-y-4">
            {categories.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium capitalize">{item.category}</span>
                  <span className="text-muted-foreground">{formatCurrency(item.total)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.round((item.total / maxCategoryTotal) * 100)}%`,
                      background: 'linear-gradient(90deg, var(--gold-dark), var(--gold-light))',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Key Metrics */}
      <GlassCard hover className="animate-fade-in-up">
        <h3 className="text-base font-semibold mb-1">Key Metrics</h3>
        <p className="text-sm text-muted-foreground mb-4">Performance snapshot</p>
        <div className="space-y-4">
          {[
            { label: 'Total Customers', value: data?.customers.total ?? 0 },
            { label: 'New Customers (month)', value: data?.customers.newThisMonth ?? 0 },
            { label: 'Appointments Today', value: data?.appointments.today ?? 0 },
            { label: 'Appointments (month)', value: data?.appointments.thisMonth ?? 0 },
            { label: 'Active Staff', value: data?.staff.active ?? 0 },
          ].map((metric) => (
            <div key={metric.label} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{metric.label}</span>
              <span className="text-sm font-semibold gold-text">{metric.value}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent Transactions */}
      <GlassCard hover className="animate-fade-in-up">
        <h3 className="text-base font-semibold mb-1">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground mb-4">Latest financial activity</p>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent transactions</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.slice(0, 8).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium capitalize">{tx.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`font-semibold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}

export default ChartsSection
