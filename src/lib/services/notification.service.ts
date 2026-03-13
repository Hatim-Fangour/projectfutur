import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { ServiceError } from './appointment.service'

// ===================================================
// Zod Schemas
// ===================================================

export const createNotificationSchema = z.object({
  type: z.enum([
    'APPOINTMENT_CREATED',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_REMINDER',
    'PAYMENT_RECEIVED',
    'LOW_STOCK',
    'STAFF_SCHEDULE_CHANGE',
    'GENERAL',
  ]).default('GENERAL'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  userId: z.string().min(1, 'User ID is required'),
  resourceType: z.string().nullable().optional(),
  resourceId: z.string().nullable().optional(),
})

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  isRead: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  userId: z.string().optional(),
})

// ===================================================
// Notification CRUD
// ===================================================

const notificationSelect = {
  id: true,
  type: true,
  title: true,
  message: true,
  isRead: true,
  userId: true,
  resourceType: true,
  resourceId: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect

export async function listNotifications(input: z.infer<typeof listNotificationsSchema>) {
  const { page, limit, isRead, userId } = input
  const skip = (page - 1) * limit

  const where: Prisma.NotificationWhereInput = {}
  if (isRead !== undefined) where.isRead = isRead
  if (userId) where.userId = userId

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: notificationSelect,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ])

  return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
}

export async function getNotificationById(id: string) {
  return prisma.notification.findUnique({
    where: { id },
    select: notificationSelect,
  })
}

export async function createNotification(input: z.infer<typeof createNotificationSchema>) {
  return prisma.notification.create({
    data: {
      type: input.type,
      title: input.title,
      message: input.message,
      userId: input.userId,
      resourceType: input.resourceType ?? null,
      resourceId: input.resourceId ?? null,
    },
    select: notificationSelect,
  })
}

export async function markAsRead(id: string) {
  const existing = await prisma.notification.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw new ServiceError('Notification not found', 404)

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
    select: notificationSelect,
  })
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
  return { message: 'All notifications marked as read' }
}

export async function deleteNotification(id: string) {
  const existing = await prisma.notification.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw new ServiceError('Notification not found', 404)

  // Notifications use hard delete since they don't have soft delete fields
  await prisma.notification.delete({ where: { id } })
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  })
  return { unreadCount: count }
}
