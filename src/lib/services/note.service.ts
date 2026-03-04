import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { ServiceError } from './appointment.service'

// ===================================================
// Zod Schemas
// ===================================================

export const createNoteSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  title: z.string().nullable().optional(),
  content: z.string().min(1, 'Content is required'),
  writer: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  isPrivate: z.boolean().default(false),
})

export const updateNoteSchema = createNoteSchema.partial().omit({ customerId: true })

export const listNotesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  customerId: z.string().optional(),
  isPrivate: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  search: z.string().optional(),
})

// ===================================================
// Note CRUD
// ===================================================

const noteSelect = {
  id: true,
  customerId: true,
  title: true,
  content: true,
  writer: true,
  tags: true,
  isPrivate: true,
  createdAt: true,
  updatedAt: true,
  customer: { select: { id: true, fullName: true } },
} satisfies Prisma.CustomerNoteSelect

export async function listNotes(input: z.infer<typeof listNotesSchema>) {
  const { page, limit, customerId, isPrivate, search } = input
  const skip = (page - 1) * limit

  const where: Prisma.CustomerNoteWhereInput = { isDeleted: false }
  if (customerId) where.customerId = customerId
  if (isPrivate !== undefined) where.isPrivate = isPrivate
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.customerNote.findMany({
      where,
      select: noteSelect,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customerNote.count({ where }),
  ])

  return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
}

export async function getNoteById(id: string) {
  return prisma.customerNote.findFirst({
    where: { id, isDeleted: false },
    select: noteSelect,
  })
}

export async function createNote(input: z.infer<typeof createNoteSchema>) {
  // Verify customer exists
  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, isDeleted: false },
    select: { id: true },
  })
  if (!customer) throw new ServiceError('Customer not found', 404)

  return prisma.customerNote.create({
    data: {
      customerId: input.customerId,
      title: input.title ?? null,
      content: input.content,
      writer: input.writer ?? null,
      tags: input.tags,
      isPrivate: input.isPrivate,
    },
    select: noteSelect,
  })
}

export async function updateNote(id: string, input: z.infer<typeof updateNoteSchema>) {
  const existing = await prisma.customerNote.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  })
  if (!existing) throw new ServiceError('Note not found', 404)

  const data: Prisma.CustomerNoteUpdateInput = {}
  if (input.title !== undefined) data.title = input.title
  if (input.content !== undefined) data.content = input.content
  if (input.writer !== undefined) data.writer = input.writer
  if (input.tags !== undefined) data.tags = input.tags
  if (input.isPrivate !== undefined) data.isPrivate = input.isPrivate

  return prisma.customerNote.update({
    where: { id },
    data,
    select: noteSelect,
  })
}

export async function deleteNote(id: string) {
  const existing = await prisma.customerNote.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  })
  if (!existing) throw new ServiceError('Note not found', 404)
  await prisma.customerNote.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  })
}
