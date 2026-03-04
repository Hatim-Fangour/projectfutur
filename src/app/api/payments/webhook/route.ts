import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { handleWebhookEvent } from '@/lib/services/payment.service'

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events.
 * This route does NOT use withAuth -- Stripe sends webhooks directly.
 * Authentication is via webhook signature verification.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify the webhook signature -- throws on invalid
    const event = constructWebhookEvent(body, signature)

    // Process the event -- all business logic happens here
    await handleWebhookEvent(event)

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('Webhook error:', error)

    // Return 400 so Stripe retries (important for webhook reliability)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 400 }
    )
  }
}
