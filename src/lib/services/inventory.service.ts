import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { ServiceError } from './appointment.service'
import { notifyLowStock } from './notification-triggers'

// ===================================================
// Zod Schemas
// ===================================================

export const createInventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().nullable().optional(),
  currentQuantity: z.number().int().min(0).default(0),
  minQuantity: z.number().int().min(0).default(0),
  unit: z.string().nullable().optional(),
  costPerUnit: z.number().positive().nullable().optional(),
  supplierName: z.string().nullable().optional(),
  supplierContact: z.string().nullable().optional(),
  reorderQuantity: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).default('IN_STOCK'),
})

export const updateInventoryItemSchema = createInventoryItemSchema.partial()

export const listInventorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).optional(),
  search: z.string().optional(),
})

// ===================================================
// Inventory CRUD
// ===================================================

const inventorySelect = {
  id: true,
  name: true,
  category: true,
  currentQuantity: true,
  minQuantity: true,
  unit: true,
  costPerUnit: true,
  supplierName: true,
  supplierContact: true,
  reorderQuantity: true,
  notes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.InventoryItemSelect

export async function listInventory(input: z.infer<typeof listInventorySchema>) {
  const { page, limit, category, status, search } = input
  const skip = (page - 1) * limit

  const where: Prisma.InventoryItemWhereInput = { isDeleted: false }
  if (category) where.category = category
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { supplierName: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      select: inventorySelect,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.inventoryItem.count({ where }),
  ])

  return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
}

export async function getInventoryItemById(id: string) {
  return prisma.inventoryItem.findFirst({
    where: { id, isDeleted: false },
    select: inventorySelect,
  })
}

export async function createInventoryItem(input: z.infer<typeof createInventoryItemSchema>) {
  const item = await prisma.inventoryItem.create({
    data: {
      name: input.name,
      category: input.category ?? null,
      currentQuantity: input.currentQuantity,
      minQuantity: input.minQuantity,
      unit: input.unit ?? null,
      costPerUnit: input.costPerUnit ?? null,
      supplierName: input.supplierName ?? null,
      supplierContact: input.supplierContact ?? null,
      reorderQuantity: input.reorderQuantity ?? null,
      notes: input.notes ?? null,
      status: input.status,
    },
    select: inventorySelect,
  })

  // Fire-and-forget: notify if created with low stock
  if (item.currentQuantity <= item.minQuantity && item.minQuantity > 0) {
    void notifyLowStock(item.id, item.name, item.currentQuantity, item.minQuantity)
  }

  return item
}

export async function updateInventoryItem(id: string, input: z.infer<typeof updateInventoryItemSchema>) {
  const existing = await prisma.inventoryItem.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  })
  if (!existing) throw new ServiceError('Inventory item not found', 404)

  const data: Prisma.InventoryItemUpdateInput = {}
  if (input.name !== undefined) data.name = input.name
  if (input.category !== undefined) data.category = input.category
  if (input.currentQuantity !== undefined) data.currentQuantity = input.currentQuantity
  if (input.minQuantity !== undefined) data.minQuantity = input.minQuantity
  if (input.unit !== undefined) data.unit = input.unit
  if (input.costPerUnit !== undefined) data.costPerUnit = input.costPerUnit
  if (input.supplierName !== undefined) data.supplierName = input.supplierName
  if (input.supplierContact !== undefined) data.supplierContact = input.supplierContact
  if (input.reorderQuantity !== undefined) data.reorderQuantity = input.reorderQuantity
  if (input.notes !== undefined) data.notes = input.notes
  if (input.status !== undefined) data.status = input.status

  // Auto-calculate status based on quantity if quantity was updated
  if (input.currentQuantity !== undefined || input.minQuantity !== undefined) {
    const currentQty = input.currentQuantity ?? existing.id ? (await prisma.inventoryItem.findUnique({ where: { id }, select: { currentQuantity: true, minQuantity: true } })) : null
    if (currentQty) {
      const qty = input.currentQuantity ?? currentQty.currentQuantity
      const minQty = input.minQuantity ?? currentQty.minQuantity
      if (qty === 0) data.status = 'OUT_OF_STOCK'
      else if (qty <= minQty) data.status = 'LOW_STOCK'
      else if (input.status === undefined) data.status = 'IN_STOCK'
    }
  }

  const updated = await prisma.inventoryItem.update({
    where: { id },
    data,
    select: inventorySelect,
  })

  // Fire-and-forget: notify managers/owners if stock fell below minimum
  if (updated.currentQuantity <= updated.minQuantity) {
    void notifyLowStock(
      updated.id,
      updated.name,
      updated.currentQuantity,
      updated.minQuantity,
    )
  }

  return updated
}

export async function deleteInventoryItem(id: string) {
  const existing = await prisma.inventoryItem.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  })
  if (!existing) throw new ServiceError('Inventory item not found', 404)
  await prisma.inventoryItem.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  })
}

// ===================================================
// Inventory — Summary
// ===================================================

export async function getInventorySummary() {
  const [total, inStock, lowStock, outOfStock] = await Promise.all([
    prisma.inventoryItem.count({ where: { isDeleted: false } }),
    prisma.inventoryItem.count({ where: { isDeleted: false, status: 'IN_STOCK' } }),
    prisma.inventoryItem.count({ where: { isDeleted: false, status: 'LOW_STOCK' } }),
    prisma.inventoryItem.count({ where: { isDeleted: false, status: 'OUT_OF_STOCK' } }),
  ])

  return { total, inStock, lowStock, outOfStock }
}
