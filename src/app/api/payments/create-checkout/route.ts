import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import {
  createCheckoutSchema,
  createCheckoutSession,
} from '@/lib/services/payment.service'
import { ServiceError } from '@/lib/services/appointment.service'
import { ZodError } from 'zod'

/**
 * POST /api/payments/create-checkout
 * Create a Stripe Checkout Session.
 */
async function handler(request: NextRequest) {
  try {
    const body = await request.json()
    const input = createCheckoutSchema.parse(body)
    const result = await createCheckoutSession(input)

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
    console.error('Create checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler, { permission: 'write:finance' })
