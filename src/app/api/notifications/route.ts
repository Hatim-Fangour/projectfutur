import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { listNotifications, createNotification, listNotificationsSchema, createNotificationSchema } from '@/lib/services/notification.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const input = listNotificationsSchema.safeParse(Object.fromEntries(searchParams.entries()))
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid query' }, { status: 400 })
      const result = await listNotifications(input.data)
      return NextResponse.json({ success: true, ...result })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/notifications error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 })
    }
  },
  // Notifications are accessible to any authenticated user
)

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const input = createNotificationSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const notification = await createNotification(input.data)
      return NextResponse.json({ success: true, data: notification }, { status: 201 })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('POST /api/notifications error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 })
    }
  },
  // Creating notifications is typically a system action, but any authenticated user can do it
)
