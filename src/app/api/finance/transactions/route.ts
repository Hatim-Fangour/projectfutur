import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { listTransactions, createTransaction, listTransactionsSchema, createTransactionSchema } from '@/lib/services/finance.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const input = listTransactionsSchema.safeParse(Object.fromEntries(searchParams.entries()))
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid query' }, { status: 400 })
      const result = await listTransactions(input.data)
      return NextResponse.json({ success: true, ...result })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/finance/transactions error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 })
    }
  },
  { permission: 'read:finance' }
)

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const input = createTransactionSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const transaction = await createTransaction(input.data)
      return NextResponse.json({ success: true, data: transaction }, { status: 201 })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('POST /api/finance/transactions error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create transaction' }, { status: 500 })
    }
  },
  { permission: 'write:finance' }
)
