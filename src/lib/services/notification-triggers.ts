import { prisma } from '@/lib/prisma'

/**
 * Notification trigger utilities.
 *
 * These functions are called by other services after successful DB operations.
 * They are fire-and-forget: errors are caught and logged, never thrown.
 * This prevents notification failures from breaking the primary operation.
 */

// ===================================================
// Appointment Triggers
// ===================================================

interface AppointmentNotificationData {
  appointmentId: string
  therapistId: string | null
  service: string | null
  customerName: string
  startTime: Date
  status?: string
}

/**
 * Notify the assigned therapist when a new appointment is created.
 */
export async function notifyAppointmentCreated(data: AppointmentNotificationData): Promise<void> {
  try {
    if (!data.therapistId) return

    // Look up the therapist's Supabase auth user ID
    const therapist = await prisma.staffMember.findFirst({
      where: { id: data.therapistId, isDeleted: false },
      select: { authUserId: true, fullName: true },
    })

    if (!therapist?.authUserId) return

    const serviceName = data.service ?? 'Appointment'
    const timeStr = data.startTime.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    await prisma.notification.create({
      data: {
        type: 'APPOINTMENT_CREATED',
        title: 'New Appointment Assigned',
        message: `${serviceName} with ${data.customerName} on ${timeStr}`,
        userId: therapist.authUserId,
        resourceType: 'appointment',
        resourceId: data.appointmentId,
      },
    })
  } catch (error) {
    console.error('Failed to create appointment notification:', error)
  }
}

/**
 * Notify relevant users when an appointment status changes.
 */
export async function notifyAppointmentStatusChanged(
  appointmentId: string,
  oldStatus: string,
  newStatus: string,
  therapistId: string | null,
  service: string | null,
  customerName: string,
): Promise<void> {
  try {
    if (oldStatus === newStatus) return

    // Determine who to notify and what message
    const statusLabels: Record<string, string> = {
      SCHEDULED: 'Scheduled',
      CONFIRMED: 'Confirmed',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      NO_SHOW: 'No Show',
    }

    const serviceName = service ?? 'Appointment'
    const newLabel = statusLabels[newStatus] ?? newStatus

    // Notify the assigned therapist about status change
    if (therapistId) {
      const therapist = await prisma.staffMember.findFirst({
        where: { id: therapistId, isDeleted: false },
        select: { authUserId: true },
      })

      if (therapist?.authUserId) {
        await prisma.notification.create({
          data: {
            type: 'APPOINTMENT_CANCELLED',
            title: `Appointment ${newLabel}`,
            message: `${serviceName} with ${customerName} is now ${newLabel.toLowerCase()}`,
            userId: therapist.authUserId,
            resourceType: 'appointment',
            resourceId: appointmentId,
          },
        })
      }
    }

    // For cancellations, also notify managers/owners
    if (newStatus === 'CANCELLED' || newStatus === 'NO_SHOW') {
      const managers = await prisma.staffMember.findMany({
        where: {
          isDeleted: false,
          role: { in: ['OWNER', 'MANAGER'] },
          authUserId: { not: null },
        },
        select: { authUserId: true },
      })

      const notificationData = managers
        .filter((m) => m.authUserId !== null)
        .map((m) => ({
          type: 'APPOINTMENT_CANCELLED' as const,
          title: `Appointment ${newLabel}`,
          message: `${serviceName} with ${customerName} has been ${newLabel.toLowerCase()}`,
          userId: m.authUserId as string,
          resourceType: 'appointment',
          resourceId: appointmentId,
        }))

      if (notificationData.length > 0) {
        await prisma.notification.createMany({ data: notificationData })
      }
    }
  } catch (error) {
    console.error('Failed to create status change notification:', error)
  }
}

// ===================================================
// Inventory Triggers
// ===================================================

/**
 * Notify manager/owner staff when an inventory item falls below its minQuantity.
 */
export async function notifyLowStock(
  itemId: string,
  itemName: string,
  currentQuantity: number,
  minQuantity: number,
): Promise<void> {
  try {
    // Only trigger if actually below threshold
    if (currentQuantity > minQuantity) return

    const statusLabel = currentQuantity === 0 ? 'out of stock' : 'low on stock'

    // Find all managers and owners with auth user IDs
    const managers = await prisma.staffMember.findMany({
      where: {
        isDeleted: false,
        role: { in: ['OWNER', 'MANAGER'] },
        authUserId: { not: null },
      },
      select: { authUserId: true },
    })

    const notificationData = managers
      .filter((m) => m.authUserId !== null)
      .map((m) => ({
        type: 'LOW_STOCK' as const,
        title: `Inventory Alert: ${itemName}`,
        message: `${itemName} is ${statusLabel} (${currentQuantity}/${minQuantity} remaining)`,
        userId: m.authUserId as string,
        resourceType: 'inventory',
        resourceId: itemId,
      }))

    if (notificationData.length > 0) {
      await prisma.notification.createMany({ data: notificationData })
    }
  } catch (error) {
    console.error('Failed to create low stock notification:', error)
  }
}
