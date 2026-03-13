import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { markAllAsRead } from '@/lib/services/notification.service'

export const POST = withAuth(
  async (_request: NextRequest, { auth }) => {
    try {
      const result = await markAllAsRead(auth.userId)
      return NextResponse.json({ success: true, data: result })
    } catch (error) {
      console.error('POST /api/notifications/mark-all-read error:', error)
      return NextResponse.json({ success: false, error: 'Failed to mark all notifications as read' }, { status: 500 })
    }
  },
)
