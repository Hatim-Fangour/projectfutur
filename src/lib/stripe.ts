import Stripe from 'stripe'

/**
 * Server-side Stripe instance.
 * Only import this in server-side code (API routes, services).
 */
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder',
  {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  }
)

/**
 * Verify a Stripe webhook signature.
 * Returns the parsed event or throws on invalid signature.
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
