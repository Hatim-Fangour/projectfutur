import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { getNotificationById, markAsRead, deleteNotification } from '@/lib/services/notification.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const notification = await getNotificationById(id)
      if (!notification) return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: notification })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/notifications/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch notification' }, { status: 500 })
    }
  },
)

export const PATCH = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const notification = await markAsRead(id)
      return NextResponse.json({ success: true, data: notification })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('PATCH /api/notifications/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to mark notification as read' }, { status: 500 })
    }
  },
)

export const DELETE = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      await deleteNotification(id)
      return NextResponse.json({ success: true, message: 'Notification deleted successfully' })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('DELETE /api/notifications/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete notification' }, { status: 500 })
    }
  },
)
