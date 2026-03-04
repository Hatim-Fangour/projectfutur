import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { ServiceError } from './appointment.service'

// ===================================================
// Zod Schemas
// ===================================================

export const createCustomerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address').optional().default(''),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  pictureURL: z.string().url().nullable().optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

export const listCustomersSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type ListCustomersInput = z.infer<typeof listCustomersSchema>

// ===================================================
// Select shapes
// ===================================================

const customerListSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  company: true,
  country: true,
  state: true,
  city: true,
  address: true,
  pictureURL: true,
  createdAt: true,
  updatedAt: true,
  appointments: {
    where: { isDeleted: false },
    take: 5,
    orderBy: { startTime: 'desc' as const },
    select: {
      id: true,
      startTime: true,
      status: true,
      service: true,
    },
  },
  notes: {
    where: { isDeleted: false },
    take: 3,
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  },
} satisfies Prisma.CustomerSelect

const customerDetailSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  company: true,
  country: true,
  state: true,
  city: true,
  address: true,
  pictureURL: true,
  createdAt: true,
  updatedAt: true,
  appointments: {
    where: { isDeleted: false },
    orderBy: { startTime: 'desc' as const },
    select: {
      id: true,
      type: true,
      startTime: true,
      endTime: true,
      status: true,
      service: true,
      notes: true,
      paymentStatus: true,
      paymentAmount: true,
      therapist: { select: { id: true, fullName: true } },
    },
  },
  notes: {
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      title: true,
      content: true,
      writer: true,
      tags: true,
      createdAt: true,
    },
  },
  services: {
    select: {
      id: true,
      totalSessions: true,
      remainingSessions: true,
      purchaseDate: true,
      expiryDate: true,
      status: true,
      pricingPlan: {
        select: { id: true, name: true, price: true, duration: true },
      },
    },
  },
  progress: {
    where: { isDeleted: false },
    orderBy: { date: 'desc' as const },
    select: {
      id: true,
      date: true,
      type: true,
      status: true,
      beforeImage: true,
      afterImage: true,
      notes: true,
      progress: true,
      therapist: true,
    },
  },
} satisfies Prisma.CustomerSelect

// ===================================================
// Service functions
// ===================================================

export async function listCustomers(input: ListCustomersInput) {
  const { search, page, limit } = input
  const skip = (page - 1) * limit

  const where: Prisma.CustomerWhereInput = { isDeleted: false }

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      select: customerListSelect,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.count({ where }),
  ])

  return {
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  }
}

export async function getCustomerById(id: string) {
  return prisma.customer.findFirst({
    where: { id, isDeleted: false },
    select: customerDetailSelect,
  })
}

export async function createCustomer(input: CreateCustomerInput) {
  if (input.email) {
    const existing = await prisma.customer.findFirst({
      where: { email: input.email, isDeleted: false },
      select: { id: true },
    })
    if (existing) throw new ServiceError(`Customer with email "${input.email}" already exists`, 409)
  }

  return prisma.customer.create({
    data: {
      fullName: input.fullName,
      email: input.email ?? '',
      phone: input.phone ?? null,
      company: input.company ?? null,
      country: input.country ?? null,
      state: input.state ?? null,
      city: input.city ?? null,
      address: input.address ?? null,
      pictureURL: input.pictureURL ?? null,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      company: true,
      country: true,
      state: true,
      city: true,
      address: true,
      pictureURL: true,
      createdAt: true,
    },
  })
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const existing = await prisma.customer.findFirst({
    where: { id, isDeleted: false },
    select: { id: true, email: true },
  })
  if (!existing) throw new ServiceError('Customer not found', 404)

  if (input.email && input.email !== existing.email) {
    const emailTaken = await prisma.customer.findFirst({
      where: { email: input.email, isDeleted: false, id: { not: id } },
      select: { id: true },
    })
    if (emailTaken) throw new ServiceError(`Customer with email "${input.email}" already exists`, 409)
  }

  const data: Prisma.CustomerUpdateInput = {}
  if (input.fullName !== undefined) data.fullName = input.fullName
  if (input.email !== undefined) data.email = input.email
  if (input.phone !== undefined) data.phone = input.phone || null
  if (input.company !== undefined) data.company = input.company || null
  if (input.country !== undefined) data.country = input.country || null
  if (input.state !== undefined) data.state = input.state || null
  if (input.city !== undefined) data.city = input.city || null
  if (input.address !== undefined) data.address = input.address || null
  if (input.pictureURL !== undefined) data.pictureURL = input.pictureURL || null

  return prisma.customer.update({
    where: { id },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      company: true,
      country: true,
      state: true,
      city: true,
      address: true,
      pictureURL: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function deleteCustomer(id: string) {
  const existing = await prisma.customer.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  })
  if (!existing) throw new ServiceError('Customer not found', 404)

  await prisma.customer.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  })
}
