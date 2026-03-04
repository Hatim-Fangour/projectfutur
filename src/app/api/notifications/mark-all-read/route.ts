import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { markAllAsRead } from '@/lib/services/notification.service'

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const userId = body?.userId
      if (!userId || typeof userId !== 'string') {
        return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 })
      }
      const result = await markAllAsRead(userId)
      return NextResponse.json({ success: true, data: result })
    } catch (error) {
      console.error('POST /api/notifications/mark-all-read error:', error)
      return NextResponse.json({ success: false, error: 'Failed to mark all notifications as read' }, { status: 500 })
    }
  },
)
