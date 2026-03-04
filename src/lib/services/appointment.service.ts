import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import {
  notifyAppointmentCreated,
  notifyAppointmentStatusChanged,
} from './notification-triggers'

// ===================================================
// Zod Schemas
// ===================================================

export const createAppointmentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  therapistId: z.string().nullable().optional(),
  type: z.enum(['SERVICE', 'CLASS', 'EVENT', 'REMINDER']).default('SERVICE'),
  startTime: z.string().datetime({ message: 'Valid start time is required' }),
  endTime: z.string().datetime({ message: 'Valid end time is required' }),
  status: z
    .enum([
      'SCHEDULED',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ])
    .default('SCHEDULED'),
  service: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  paymentStatus: z.string().nullable().optional(),
  paymentAmount: z.number().nullable().optional(),
})

export const updateAppointmentSchema = createAppointmentSchema.partial()

export const listAppointmentsSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum([
      'SCHEDULED',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ])
    .optional(),
  therapistId: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type ListAppointmentsInput = z.infer<typeof listAppointmentsSchema>

// ===================================================
// Select shapes (never return full models)
// ===================================================

const appointmentListSelect = {
  id: true,
  customerId: true,
  therapistId: true,
  type: true,
  startTime: true,
  endTime: true,
  status: true,
  service: true,
  reason: true,
  location: true,
  notes: true,
  paymentStatus: true,
  paymentAmount: true,
  createdAt: true,
  customer: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      pictureURL: true,
    },
  },
  therapist: {
    select: {
      id: true,
      fullName: true,
      pictureURL: true,
    },
  },
} satisfies Prisma.AppointmentSelect

const appointmentDetailSelect = {
  ...appointmentListSelect,
  updatedAt: true,
} satisfies Prisma.AppointmentSelect

// ===================================================
// Service functions
// ===================================================

export async function listAppointments(input: ListAppointmentsInput) {
  const { search, page, limit, status, therapistId, start, end } = input
  const skip = (page - 1) * limit

  const where: Prisma.AppointmentWhereInput = {
    isDeleted: false,
  }

  if (status) where.status = status
  if (therapistId) where.therapistId = therapistId

  if (start || end) {
    where.startTime = {}
    if (start) where.startTime.gte = new Date(start)
    if (end) where.startTime.lte = new Date(end)
  }

  if (search) {
    where.OR = [
      { service: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      { customer: { fullName: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      select: appointmentListSelect,
      skip,
      take: limit,
      orderBy: { startTime: 'asc' },
    }),
    prisma.appointment.count({ where }),
  ])

  return {
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  }
}

export async function getAppointmentById(id: string) {
  return prisma.appointment.findFirst({
    where: { id, isDeleted: false },
    select: appointmentDetailSelect,
  })
}

export async function createAppointment(input: CreateAppointmentInput) {
  // Verify customer exists
  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, isDeleted: false },
    select: { id: true, fullName: true },
  })
  if (!customer) throw new ServiceError('Customer not found', 404)

  // Check therapist availability
  if (input.therapistId) {
    const conflict = await checkTherapistAvailability(
      input.therapistId,
      new Date(input.startTime),
      new Date(input.endTime)
    )
    if (conflict) throw new ServiceError('Therapist is not available at this time', 409)
  }

  const appointment = await prisma.appointment.create({
    data: {
      customerId: input.customerId,
      therapistId: input.therapistId ?? null,
      type: input.type,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      status: input.status,
      service: input.service ?? null,
      reason: input.reason ?? null,
      location: input.location ?? null,
      notes: input.notes ?? null,
      paymentStatus: input.paymentStatus ?? null,
      paymentAmount: input.paymentAmount ?? null,
    },
    select: appointmentDetailSelect,
  })

  // Fire-and-forget: notify assigned therapist
  void notifyAppointmentCreated({
    appointmentId: appointment.id,
    therapistId: input.therapistId ?? null,
    service: input.service ?? null,
    customerName: customer.fullName,
    startTime: new Date(input.startTime),
  })

  return appointment
}

export async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput
) {
  const existing = await prisma.appointment.findFirst({
    where: { id, isDeleted: false },
    select: {
      id: true,
      therapistId: true,
      startTime: true,
      endTime: true,
      status: true,
      service: true,
      customer: { select: { fullName: true } },
    },
  })
  if (!existing) throw new ServiceError('Appointment not found', 404)

  // Check therapist availability if changing therapist or time
  const newTherapistId = input.therapistId ?? existing.therapistId
  const newStartTime = input.startTime
    ? new Date(input.startTime)
    : existing.startTime
  const newEndTime = input.endTime ? new Date(input.endTime) : existing.endTime

  if (newTherapistId) {
    const conflict = await checkTherapistAvailability(
      newTherapistId,
      newStartTime,
      newEndTime,
      id
    )
    if (conflict) throw new ServiceError('Therapist is not available at this time', 409)
  }

  const data: Prisma.AppointmentUpdateInput = {}
  if (input.customerId !== undefined) data.customer = { connect: { id: input.customerId } }
  if (input.therapistId !== undefined)
    data.therapist = input.therapistId
      ? { connect: { id: input.therapistId } }
      : { disconnect: true }
  if (input.type !== undefined) data.type = input.type
  if (input.startTime !== undefined) data.startTime = new Date(input.startTime)
  if (input.endTime !== undefined) data.endTime = new Date(input.endTime)
  if (input.status !== undefined) data.status = input.status
  if (input.service !== undefined) data.service = input.service
  if (input.reason !== undefined) data.reason = input.reason
  if (input.location !== undefined) data.location = input.location
  if (input.notes !== undefined) data.notes = input.notes
  if (input.paymentStatus !== undefined) data.paymentStatus = input.paymentStatus
  if (input.paymentAmount !== undefined) data.paymentAmount = input.paymentAmount

  const updated = await prisma.appointment.update({
    where: { id },
    data,
    select: appointmentDetailSelect,
  })

  // Fire-and-forget: notify on status change
  if (input.status !== undefined && input.status !== existing.status) {
    void notifyAppointmentStatusChanged(
      id,
      existing.status,
      input.status,
      newTherapistId,
      input.service ?? existing.service,
      existing.customer.fullName,
    )
  }

  return updated
}

export async function deleteAppointment(id: string) {
  const existing = await prisma.appointment.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  })
  if (!existing) throw new ServiceError('Appointment not found', 404)

  await prisma.appointment.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  })
}

// ===================================================
// Helpers
// ===================================================

async function checkTherapistAvailability(
  therapistId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
): Promise<boolean> {
  const where: Prisma.AppointmentWhereInput = {
    therapistId,
    isDeleted: false,
    status: { notIn: ['CANCELLED', 'NO_SHOW'] },
    startTime: { lt: endTime },
    endTime: { gt: startTime },
  }
  if (excludeAppointmentId) {
    where.id = { not: excludeAppointmentId }
  }
  const conflict = await prisma.appointment.findFirst({ where, select: { id: true } })
  return !!conflict
}

// ===================================================
// Service Error class
// ===================================================

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}
