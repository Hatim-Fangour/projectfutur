import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { getFinanceOverview } from '@/lib/services/finance.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (_request: NextRequest) => {
    try {
      const overview = await getFinanceOverview()
      return NextResponse.json({ success: true, data: overview })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/finance/overview error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch finance overview' }, { status: 500 })
    }
  },
  { permission: 'read:finance' }
)
