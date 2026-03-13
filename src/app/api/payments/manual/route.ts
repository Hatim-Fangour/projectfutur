import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import {
  manualPaymentSchema,
  recordManualPayment,
} from '@/lib/services/payment.service'
import { ServiceError } from '@/lib/services/appointment.service'
import { ZodError } from 'zod'

/**
 * POST /api/payments/manual
 * Record a manual (cash/bank/check) payment.
 */
async function handler(request: NextRequest) {
  try {
    const body = await request.json()
    const input = manualPaymentSchema.parse(body)
    const result = await recordManualPayment(input)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('Manual payment error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record payment' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler, { permission: 'write:finance' })
