import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { getUnreadCount } from '@/lib/services/notification.service'

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const userId = searchParams.get('userId')
      if (!userId) {
        return NextResponse.json({ success: false, error: 'userId query parameter is required' }, { status: 400 })
      }
      const result = await getUnreadCount(userId)
      return NextResponse.json({ success: true, data: result })
    } catch (error) {
      console.error('GET /api/notifications/unread-count error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch unread count' }, { status: 500 })
    }
  },
)
