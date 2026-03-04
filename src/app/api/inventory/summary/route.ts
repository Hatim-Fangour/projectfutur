import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { getInventorySummary } from '@/lib/services/inventory.service'

export const GET = withAuth(
  async (_request: NextRequest) => {
    try {
      const summary = await getInventorySummary()
      return NextResponse.json({ success: true, data: summary })
    } catch (error) {
      console.error('GET /api/inventory/summary error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch inventory summary' }, { status: 500 })
    }
  },
  { permission: 'read:inventory' }
)
