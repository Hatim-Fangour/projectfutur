import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { getUnreadCount } from '@/lib/services/notification.service'

export const GET = withAuth(
  async (_request: NextRequest, { auth }) => {
    try {
      const result = await getUnreadCount(auth.userId)
      return NextResponse.json({ success: true, data: result })
    } catch (error) {
      console.error('GET /api/notifications/unread-count error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch unread count' }, { status: 500 })
    }
  },
)
