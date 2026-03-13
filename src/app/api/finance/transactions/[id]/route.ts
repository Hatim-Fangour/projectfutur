import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { updateTransaction, deleteTransaction, updateTransactionSchema } from '@/lib/services/finance.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const PUT = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const body = await request.json()
      const input = updateTransactionSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const transaction = await updateTransaction(id, input.data)
      return NextResponse.json({ success: true, data: transaction })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('PUT /api/finance/transactions/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update transaction' }, { status: 500 })
    }
  },
  { permission: 'write:finance' }
)

export const DELETE = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      await deleteTransaction(id)
      return NextResponse.json({ success: true, message: 'Transaction deleted successfully' })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('DELETE /api/finance/transactions/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete transaction' }, { status: 500 })
    }
  },
  { permission: 'delete:finance' }
)
