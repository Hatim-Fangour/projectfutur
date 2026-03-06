import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { ServiceError } from './appointment.service'

// ===================================================
// Zod Schemas
// ===================================================

export const createStaffSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().nullable().optional(),
  dateOfBirth: z.string().datetime().nullable().optional(),
  address: z.string().nullable().optional(),
  pictureURL: z.string().url().nullable().optional(),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF', 'RECEPTIONIST', 'THERAPIST']).default('THERAPIST'),
  department: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).default('ACTIVE'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE']).default('FULL_TIME'),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  specializations: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
})

export const updateStaffSchema = createStaffSchema.partial()

export const listStaffSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF', 'RECEPTIONIST', 'THERAPIST']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
})

export const updateScheduleSchema = z.object({
  schedules: z.array(
    z.object({
      dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm format'),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm format'),
      isWorking: z.boolean().default(true),
    })
  ),
})

export type CreateStaffInput = z.infer<typeof createStaffSchema>
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>
export type ListStaffInput = z.infer<typeof listStaffSchema>
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>

// ===================================================
// Select shapes
// ===================================================

const staffListSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  pictureURL: true,
  role: true,
  department: true,
  status: true,
  employmentType: true,
  specializations: true,
  certifications: true,
  startDate: true,
  createdAt: true,
} satisfies Prisma.StaffMemberSelect

const staffDetailSelect = {
  ...staffListSelect,
  dateOfBirth: true,
  address: true,
  endDate: true,
  updatedAt: true,
  schedules: {
    orderBy: { dayOfWeek: 'asc' as const },
    select: {
      id: true,
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      isWorking: true,
    },
  },
  _count: {
    select: {
      appointments: { where: { isDeleted: false } },
    },
  },
} satisfies Prisma.StaffMemberSelect

// ===================================================
// Service functions
// ===================================================

export async function listStaff(input: ListStaffInput) {
  const { search, page, limit, role, status } = input
  const skip = (page - 1) * limit

  const where: Prisma.StaffMemberWhereInput = { isDeleted: false }
  if (role) where.role = role
  if (status) where.status = status

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { department: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.staffMember.findMany({
      where,
      select: staffListSelect,
      skip,
      take: limit,
      orderBy: { fullName: 'asc' },
    }),
    prisma.staffMember.count({ where }),
  ])

  return {
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  }
}

export async function getStaffById(id: string) {
  return prisma.staffMember.findFirst({
    where: { id, isDeleted: false },
    select: staffDetailSelect,
  })
}

export async function createStaff(input: CreateStaffInput) {
  const existing = await prisma.staffMember.findFirst({
    where: { email: input.email, isDeleted: false },
    select: { id: true },
  })
  if (existing) throw new ServiceError(`Staff member with email "${input.email}" already exists`, 409)

  return prisma.staffMember.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      address: input.address ?? null,
      pictureURL: input.pictureURL ?? null,
      role: input.role,
      department: input.department ?? null,
      status: input.status,
      employmentType: input.employmentType,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      specializations: input.specializations,
      certifications: input.certifications,
    },
    select: staffDetailSelect,
  })
}

const ROLE_HIERARCHY: Record<string, number> = {
  THERAPIST: 1,
  RECEPTIONIST: 2,
  STAFF: 3,
  MANAGER: 4,
  OWNER: 5,
}

export async function updateStaff(id: string, input: UpdateStaffInput, callerRole?: string) {
  const existing = await prisma.staffMember.findFirst({
    where: { id, isDeleted: false },
    select: { id: true, email: true, role: true },
  })
  if (!existing) throw new ServiceError('Staff member not found', 404)

  // Prevent role escalation: only OWNER can assign OWNER, and no one can assign a role above their own
  if (input.role !== undefined && callerRole) {
    const callerLevel = ROLE_HIERARCHY[callerRole] ?? 0
    const targetLevel = ROLE_HIERARCHY[input.role] ?? 0
    if (targetLevel > callerLevel) {
      throw new ServiceError('You cannot assign a role higher than your own', 403)
    }
  }

  if (input.email && input.email !== existing.email) {
    const emailTaken = await prisma.staffMember.findFirst({
      where: { email: input.email, isDeleted: false, id: { not: id } },
      select: { id: true },
    })
    if (emailTaken) throw new ServiceError(`Staff member with email "${input.email}" already exists`, 409)
  }

  const data: Prisma.StaffMemberUpdateInput = {}
  if (input.fullName !== undefined) data.fullName = input.fullName
  if (input.email !== undefined) data.email = input.email
  if (input.phone !== undefined) data.phone = input.phone || null
  if (input.dateOfBirth !== undefined) data.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null
  if (input.address !== undefined) data.address = input.address || null
  if (input.pictureURL !== undefined) data.pictureURL = input.pictureURL || null
  if (input.role !== undefined) data.role = input.role
  if (input.department !== undefined) data.department = input.department || null
  if (input.status !== undefined) data.status = input.status
  if (input.employmentType !== undefined) data.employmentType = input.employmentType
  if (input.startDate !== undefined) data.startDate = input.startDate ? new Date(input.startDate) : null
  if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null
  if (input.specializations !== undefined) data.specializations = input.specializations
  if (input.certifications !== undefined) data.certifications = input.certifications

  return prisma.staffMember.update({
    where: { id },
    data,
    select: staffDetailSelect,
  })
}

export async function deleteStaff(id: string) {
  const existing = await prisma.staffMember.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  })
  if (!existing) throw new ServiceError('Staff member not found', 404)

  await prisma.staffMember.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  })
}

export async function getStaffSchedule(staffId: string) {
  const staff = await prisma.staffMember.findFirst({
    where: { id: staffId, isDeleted: false },
    select: { id: true },
  })
  if (!staff) throw new ServiceError('Staff member not found', 404)

  return prisma.staffSchedule.findMany({
    where: { staffId },
    orderBy: { dayOfWeek: 'asc' },
    select: {
      id: true,
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      isWorking: true,
    },
  })
}

export async function updateStaffSchedule(staffId: string, input: UpdateScheduleInput) {
  const staff = await prisma.staffMember.findFirst({
    where: { id: staffId, isDeleted: false },
    select: { id: true },
  })
  if (!staff) throw new ServiceError('Staff member not found', 404)

  // Use transaction: delete existing schedules and create new ones
  return prisma.$transaction(async (tx) => {
    await tx.staffSchedule.deleteMany({ where: { staffId } })

    const schedules = await Promise.all(
      input.schedules.map((s) =>
        tx.staffSchedule.create({
          data: {
            staffId,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            isWorking: s.isWorking,
          },
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isWorking: true,
          },
        })
      )
    )

    return schedules
  })
}
