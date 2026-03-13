import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { ServiceError } from './appointment.service'

// ===================================================
// Zod Schemas — Transactions
// ===================================================

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  date: z.string().datetime({ message: 'Valid date is required' }),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'STRIPE', 'CHECK', 'OTHER']).default('CASH'),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED']).default('COMPLETED'),
  appointmentId: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  receiptURL: z.string().url().nullable().optional(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const listTransactionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customerId: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'STRIPE', 'CHECK', 'OTHER']).optional(),
})

// ===================================================
// Zod Schemas — Budgets
// ===================================================

export const createBudgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).default('MONTHLY'),
  notes: z.string().nullable().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export const updateBudgetSchema = createBudgetSchema.partial()

// ===================================================
// Zod Schemas — Savings Goals
// ===================================================

export const createSavingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0).default(0),
  deadline: z.string().datetime().nullable().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).default('ACTIVE'),
})

export const updateSavingsSchema = createSavingsSchema.partial()

// ===================================================
// Transactions
// ===================================================

export async function listTransactions(input: z.infer<typeof listTransactionsSchema>) {
  const { page, limit, type, category, status, startDate, endDate, customerId, paymentMethod } = input
  const skip = (page - 1) * limit

  const where: Prisma.TransactionWhereInput = { isDeleted: false }
  if (type) where.type = type
  if (category) where.category = category
  if (status) where.status = status
  if (customerId) where.customerId = customerId
  if (paymentMethod) where.paymentMethod = paymentMethod
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = new Date(startDate)
    if (endDate) where.date.lte = new Date(endDate)
  }

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      select: {
        id: true,
        type: true,
        category: true,
        amount: true,
        currency: true,
        description: true,
        date: true,
        paymentMethod: true,
        status: true,
        customerId: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { date: 'desc' },
    }),
    prisma.transaction.count({ where }),
  ])

  return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
}

export async function createTransaction(input: z.infer<typeof createTransactionSchema>) {
  return prisma.transaction.create({
    data: {
      type: input.type,
      category: input.category,
      amount: input.amount,
      currency: input.currency,
      description: input.description ?? null,
      notes: input.notes ?? null,
      date: new Date(input.date),
      paymentMethod: input.paymentMethod,
      status: input.status,
      appointmentId: input.appointmentId ?? null,
      customerId: input.customerId ?? null,
      receiptURL: input.receiptURL ?? null,
    },
    select: {
      id: true,
      type: true,
      category: true,
      amount: true,
      currency: true,
      description: true,
      date: true,
      paymentMethod: true,
      status: true,
      createdAt: true,
    },
  })
}

export async function updateTransaction(id: string, input: z.infer<typeof updateTransactionSchema>) {
  const existing = await prisma.transaction.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Transaction not found', 404)

  const data: Prisma.TransactionUpdateInput = {}
  if (input.type !== undefined) data.type = input.type
  if (input.category !== undefined) data.category = input.category
  if (input.amount !== undefined) data.amount = input.amount
  if (input.currency !== undefined) data.currency = input.currency
  if (input.description !== undefined) data.description = input.description
  if (input.notes !== undefined) data.notes = input.notes
  if (input.date !== undefined) data.date = new Date(input.date)
  if (input.paymentMethod !== undefined) data.paymentMethod = input.paymentMethod
  if (input.status !== undefined) data.status = input.status

  return prisma.transaction.update({
    where: { id },
    data,
    select: { id: true, type: true, category: true, amount: true, date: true, status: true, updatedAt: true },
  })
}

export async function deleteTransaction(id: string) {
  const existing = await prisma.transaction.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Transaction not found', 404)
  await prisma.transaction.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } })
}

// ===================================================
// Finance Overview
// ===================================================

export async function getFinanceOverview() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const baseWhere = { isDeleted: false, status: 'COMPLETED' as const, date: { gte: startOfMonth, lte: endOfMonth } }

  const [income, expenses, recentTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: 'INCOME' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.findMany({
      where: { isDeleted: false },
      select: { id: true, type: true, category: true, amount: true, date: true, description: true, status: true },
      orderBy: { date: 'desc' },
      take: 10,
    }),
  ])

  const totalIncome = Number(income._sum.amount ?? 0)
  const totalExpenses = Number(expenses._sum.amount ?? 0)

  return {
    totalIncome,
    totalExpenses,
    profit: totalIncome - totalExpenses,
    incomeCount: income._count,
    expenseCount: expenses._count,
    period: { start: startOfMonth.toISOString(), end: endOfMonth.toISOString() },
    recentTransactions,
  }
}

// ===================================================
// Budgets
// ===================================================

export async function listBudgets() {
  return prisma.budget.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      category: true,
      amount: true,
      spent: true,
      period: true,
      notes: true,
      startDate: true,
      endDate: true,
      createdAt: true,
    },
    orderBy: { category: 'asc' },
  })
}

export async function createBudget(input: z.infer<typeof createBudgetSchema>) {
  return prisma.budget.create({
    data: {
      category: input.category,
      amount: input.amount,
      period: input.period,
      notes: input.notes ?? null,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
    },
    select: { id: true, category: true, amount: true, spent: true, period: true, startDate: true, endDate: true, createdAt: true },
  })
}

export async function updateBudget(id: string, input: z.infer<typeof updateBudgetSchema>) {
  const existing = await prisma.budget.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Budget not found', 404)

  return prisma.budget.update({
    where: { id },
    data: {
      ...(input.category !== undefined && { category: input.category }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.period !== undefined && { period: input.period }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.startDate !== undefined && { startDate: new Date(input.startDate) }),
      ...(input.endDate !== undefined && { endDate: new Date(input.endDate) }),
    },
    select: { id: true, category: true, amount: true, spent: true, period: true, startDate: true, endDate: true, updatedAt: true },
  })
}

export async function deleteBudget(id: string) {
  const existing = await prisma.budget.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Budget not found', 404)
  await prisma.budget.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } })
}

// ===================================================
// Savings Goals
// ===================================================

export async function listSavings() {
  return prisma.savingsGoal.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      name: true,
      description: true,
      targetAmount: true,
      currentAmount: true,
      deadline: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createSavings(input: z.infer<typeof createSavingsSchema>) {
  return prisma.savingsGoal.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      targetAmount: input.targetAmount,
      currentAmount: input.currentAmount,
      deadline: input.deadline ? new Date(input.deadline) : null,
      status: input.status,
    },
    select: { id: true, name: true, targetAmount: true, currentAmount: true, deadline: true, status: true, createdAt: true },
  })
}

export async function updateSavings(id: string, input: z.infer<typeof updateSavingsSchema>) {
  const existing = await prisma.savingsGoal.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Savings goal not found', 404)

  return prisma.savingsGoal.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.targetAmount !== undefined && { targetAmount: input.targetAmount }),
      ...(input.currentAmount !== undefined && { currentAmount: input.currentAmount }),
      ...(input.deadline !== undefined && { deadline: input.deadline ? new Date(input.deadline) : null }),
      ...(input.status !== undefined && { status: input.status }),
    },
    select: { id: true, name: true, targetAmount: true, currentAmount: true, deadline: true, status: true, updatedAt: true },
  })
}

export async function deleteSavings(id: string) {
  const existing = await prisma.savingsGoal.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Savings goal not found', 404)
  await prisma.savingsGoal.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } })
}
