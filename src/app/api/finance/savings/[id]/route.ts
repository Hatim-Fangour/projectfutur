import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { updateSavings, deleteSavings, updateSavingsSchema } from '@/lib/services/finance.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const PUT = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const body = await request.json()
      const input = updateSavingsSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const goal = await updateSavings(id, input.data)
      return NextResponse.json({ success: true, data: goal })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('PUT /api/finance/savings/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update savings goal' }, { status: 500 })
    }
  },
  { permission: 'write:finance' }
)

export const DELETE = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      await deleteSavings(id)
      return NextResponse.json({ success: true, message: 'Savings goal deleted successfully' })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('DELETE /api/finance/savings/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete savings goal' }, { status: 500 })
    }
  },
  { permission: 'delete:finance' }
)
