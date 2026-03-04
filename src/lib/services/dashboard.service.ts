import { prisma } from '@/lib/prisma'

// ===================================================
// Dashboard Overview — Aggregation service
// ===================================================

export async function getDashboardOverview() {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [
    totalCustomers,
    newCustomersThisMonth,
    todayAppointments,
    monthAppointments,
    upcomingAppointments,
    monthlyIncome,
    monthlyExpenses,
    activeStaff,
    lowStockItems,
    recentNotifications,
  ] = await Promise.all([
    // Total active customers
    prisma.customer.count({ where: { isDeleted: false } }),

    // New customers this month
    prisma.customer.count({
      where: { isDeleted: false, createdAt: { gte: startOfMonth, lte: endOfMonth } },
    }),

    // Today's appointments
    prisma.appointment.count({
      where: {
        isDeleted: false,
        startTime: { gte: startOfToday, lte: endOfToday },
      },
    }),

    // Total appointments this month
    prisma.appointment.count({
      where: {
        isDeleted: false,
        startTime: { gte: startOfMonth, lte: endOfMonth },
      },
    }),

    // Next 5 upcoming appointments
    prisma.appointment.findMany({
      where: {
        isDeleted: false,
        startTime: { gte: now },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        service: true,
        customer: { select: { id: true, fullName: true, pictureURL: true } },
        therapist: { select: { id: true, fullName: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    }),

    // Monthly income
    prisma.transaction.aggregate({
      where: {
        isDeleted: false,
        type: 'INCOME',
        status: 'COMPLETED',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),

    // Monthly expenses
    prisma.transaction.aggregate({
      where: {
        isDeleted: false,
        type: 'EXPENSE',
        status: 'COMPLETED',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),

    // Active staff count
    prisma.staffMember.count({ where: { isDeleted: false, status: 'ACTIVE' } }),

    // Low stock inventory items
    prisma.inventoryItem.count({
      where: { isDeleted: false, status: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] } },
    }),

    // Recent unread notifications (count)
    prisma.notification.count({ where: { isRead: false } }),
  ])

  const totalIncome = Number(monthlyIncome._sum.amount ?? 0)
  const totalExpenses = Number(monthlyExpenses._sum.amount ?? 0)

  return {
    customers: {
      total: totalCustomers,
      newThisMonth: newCustomersThisMonth,
    },
    appointments: {
      today: todayAppointments,
      thisMonth: monthAppointments,
      upcoming: upcomingAppointments,
    },
    finance: {
      income: totalIncome,
      expenses: totalExpenses,
      profit: totalIncome - totalExpenses,
    },
    staff: {
      active: activeStaff,
    },
    inventory: {
      lowStockCount: lowStockItems,
    },
    notifications: {
      unreadCount: recentNotifications,
    },
    period: {
      start: startOfMonth.toISOString(),
      end: endOfMonth.toISOString(),
    },
  }
}

// ===================================================
// Dashboard — Recent Activity
// ===================================================

export async function getRecentActivity(limit = 20) {
  const [recentAppointments, recentTransactions] = await Promise.all([
    prisma.appointment.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        startTime: true,
        status: true,
        service: true,
        createdAt: true,
        customer: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.transaction.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        type: true,
        category: true,
        amount: true,
        date: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ])

  return { recentAppointments, recentTransactions }
}
