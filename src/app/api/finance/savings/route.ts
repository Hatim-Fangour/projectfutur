import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { listSavings, createSavings, createSavingsSchema } from '@/lib/services/finance.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (_request: NextRequest) => {
    try {
      const data = await listSavings()
      return NextResponse.json({ success: true, data })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/finance/savings error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch savings goals' }, { status: 500 })
    }
  },
  { permission: 'read:finance' }
)

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const input = createSavingsSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const goal = await createSavings(input.data)
      return NextResponse.json({ success: true, data: goal }, { status: 201 })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('POST /api/finance/savings error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create savings goal' }, { status: 500 })
    }
  },
  { permission: 'write:finance' }
)
