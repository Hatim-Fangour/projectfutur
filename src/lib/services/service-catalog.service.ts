import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { ServiceError } from './appointment.service'

// ===================================================
// Zod Schemas — Categories
// ===================================================

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export const updateCategorySchema = createCategorySchema.partial()

// ===================================================
// Zod Schemas — Service Items
// ===================================================

export const createItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  duration: z.number().int().positive().nullable().optional(),
  preparationTime: z.number().int().nullable().optional(),
  recoveryTime: z.number().int().nullable().optional(),
  contraindications: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
})

export const updateItemSchema = createItemSchema.partial()

// ===================================================
// Zod Schemas — Pricing Plans
// ===================================================

export const createPricingSchema = z.object({
  serviceItemId: z.string().nullable().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('USD'),
  duration: z.number().int().positive().nullable().optional(),
  billingType: z.enum(['SINGLE', 'PACKAGE', 'SUBSCRIPTION']).default('SINGLE'),
  sessionsIncluded: z.number().int().positive().nullable().optional(),
  validityDays: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
})

export const updatePricingSchema = createPricingSchema.partial()

export const listServicesSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  categoryId: z.string().optional(),
})

// ===================================================
// Service functions — Categories
// ===================================================

export async function listCategories() {
  return prisma.serviceCategory.findMany({
    where: { isDeleted: false },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      icon: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      _count: { select: { items: { where: { isDeleted: false } } } },
    },
  })
}

export async function getCategoryById(id: string) {
  return prisma.serviceCategory.findFirst({
    where: { id, isDeleted: false },
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      icon: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      items: {
        where: { isDeleted: false },
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          isActive: true,
          pricingPlans: {
            where: { isDeleted: false },
            select: {
              id: true,
              name: true,
              price: true,
              billingType: true,
              sessionsIncluded: true,
            },
          },
        },
      },
    },
  })
}

export async function createCategory(input: z.infer<typeof createCategorySchema>) {
  return prisma.serviceCategory.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      color: input.color ?? null,
      icon: input.icon ?? null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    },
    select: { id: true, name: true, description: true, color: true, icon: true, sortOrder: true, isActive: true, createdAt: true },
  })
}

export async function updateCategory(id: string, input: z.infer<typeof updateCategorySchema>) {
  const existing = await prisma.serviceCategory.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Category not found', 404)

  return prisma.serviceCategory.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
    select: { id: true, name: true, description: true, color: true, icon: true, sortOrder: true, isActive: true, createdAt: true },
  })
}

export async function deleteCategory(id: string) {
  const existing = await prisma.serviceCategory.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Category not found', 404)
  await prisma.serviceCategory.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } })
}

// ===================================================
// Service functions — Items
// ===================================================

export async function listItems(input: z.infer<typeof listServicesSchema>) {
  const { search, page, limit, categoryId } = input
  const skip = (page - 1) * limit

  const where: Prisma.ServiceItemWhereInput = { isDeleted: false }
  if (categoryId) where.categoryId = categoryId
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.serviceItem.findMany({
      where,
      select: {
        id: true,
        categoryId: true,
        title: true,
        description: true,
        duration: true,
        preparationTime: true,
        recoveryTime: true,
        isActive: true,
        createdAt: true,
        category: { select: { id: true, name: true, color: true } },
        pricingPlans: {
          where: { isDeleted: false },
          select: { id: true, name: true, price: true, billingType: true, duration: true, sessionsIncluded: true },
        },
      },
      skip,
      take: limit,
      orderBy: { title: 'asc' },
    }),
    prisma.serviceItem.count({ where }),
  ])

  return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
}

export async function getItemById(id: string) {
  return prisma.serviceItem.findFirst({
    where: { id, isDeleted: false },
    select: {
      id: true,
      categoryId: true,
      title: true,
      description: true,
      duration: true,
      preparationTime: true,
      recoveryTime: true,
      contraindications: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { id: true, name: true, color: true } },
      pricingPlans: {
        where: { isDeleted: false },
        select: { id: true, name: true, description: true, price: true, currency: true, billingType: true, duration: true, sessionsIncluded: true, validityDays: true, isActive: true },
      },
    },
  })
}

export async function createItem(input: z.infer<typeof createItemSchema>) {
  const category = await prisma.serviceCategory.findFirst({ where: { id: input.categoryId, isDeleted: false }, select: { id: true } })
  if (!category) throw new ServiceError('Category not found', 404)

  return prisma.serviceItem.create({
    data: {
      categoryId: input.categoryId,
      title: input.title,
      description: input.description ?? null,
      duration: input.duration ?? null,
      preparationTime: input.preparationTime ?? null,
      recoveryTime: input.recoveryTime ?? null,
      contraindications: input.contraindications ?? null,
      isActive: input.isActive,
    },
    select: { id: true, categoryId: true, title: true, description: true, duration: true, isActive: true, createdAt: true },
  })
}

export async function updateItem(id: string, input: z.infer<typeof updateItemSchema>) {
  const existing = await prisma.serviceItem.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Service item not found', 404)

  return prisma.serviceItem.update({
    where: { id },
    data: {
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.duration !== undefined && { duration: input.duration }),
      ...(input.preparationTime !== undefined && { preparationTime: input.preparationTime }),
      ...(input.recoveryTime !== undefined && { recoveryTime: input.recoveryTime }),
      ...(input.contraindications !== undefined && { contraindications: input.contraindications }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
    select: { id: true, categoryId: true, title: true, description: true, duration: true, isActive: true, updatedAt: true },
  })
}

export async function deleteItem(id: string) {
  const existing = await prisma.serviceItem.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Service item not found', 404)
  await prisma.serviceItem.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } })
}

// ===================================================
// Service functions — Pricing Plans
// ===================================================

export async function listPricing(params?: { serviceItemId?: string }) {
  const where: Prisma.PricingPlanWhereInput = { isDeleted: false }
  if (params?.serviceItemId) where.serviceItemId = params.serviceItemId

  return prisma.pricingPlan.findMany({
    where,
    select: {
      id: true,
      serviceItemId: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      duration: true,
      billingType: true,
      sessionsIncluded: true,
      validityDays: true,
      isActive: true,
      createdAt: true,
      serviceItem: { select: { id: true, title: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export async function createPricing(input: z.infer<typeof createPricingSchema>) {
  return prisma.pricingPlan.create({
    data: {
      serviceItemId: input.serviceItemId ?? null,
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      currency: input.currency,
      duration: input.duration ?? null,
      billingType: input.billingType,
      sessionsIncluded: input.sessionsIncluded ?? null,
      validityDays: input.validityDays ?? null,
      isActive: input.isActive,
    },
    select: { id: true, name: true, price: true, billingType: true, isActive: true, createdAt: true },
  })
}

export async function updatePricing(id: string, input: z.infer<typeof updatePricingSchema>) {
  const existing = await prisma.pricingPlan.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Pricing plan not found', 404)

  return prisma.pricingPlan.update({
    where: { id },
    data: {
      ...(input.serviceItemId !== undefined && { serviceItemId: input.serviceItemId }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.duration !== undefined && { duration: input.duration }),
      ...(input.billingType !== undefined && { billingType: input.billingType }),
      ...(input.sessionsIncluded !== undefined && { sessionsIncluded: input.sessionsIncluded }),
      ...(input.validityDays !== undefined && { validityDays: input.validityDays }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
    select: { id: true, name: true, price: true, billingType: true, isActive: true, updatedAt: true },
  })
}

export async function deletePricing(id: string) {
  const existing = await prisma.pricingPlan.findFirst({ where: { id, isDeleted: false }, select: { id: true } })
  if (!existing) throw new ServiceError('Pricing plan not found', 404)
  await prisma.pricingPlan.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } })
}
