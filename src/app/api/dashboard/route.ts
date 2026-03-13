import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { getDashboardOverview, getRecentActivity } from '@/lib/services/dashboard.service'

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const includeActivity = searchParams.get('includeActivity') === 'true'

      const overview = await getDashboardOverview()
      const result: Record<string, unknown> = { ...overview }

      if (includeActivity) {
        const activity = await getRecentActivity()
        result.recentActivity = activity
      }

      return NextResponse.json({ success: true, data: result })
    } catch (error) {
      console.error('GET /api/dashboard error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 })
    }
  },
  // Dashboard is read-only and accessible to anyone who is authenticated
  // No specific permission required — all roles can view the dashboard
)
