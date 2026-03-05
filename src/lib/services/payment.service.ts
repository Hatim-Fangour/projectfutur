import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'
import { ServiceError } from './appointment.service'
import { Prisma } from '@prisma/client'
import type Stripe from 'stripe'

// ===================================================
// Zod Schemas
// ===================================================

export const createCheckoutSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  appointmentId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('usd'),
  description: z.string().optional(),
  successUrl: z.string().url('Valid success URL is required'),
  cancelUrl: z.string().url('Valid cancel URL is required'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
})

export const createPaymentIntentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  appointmentId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('usd'),
  description: z.string().optional(),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
})

export const manualPaymentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  appointmentId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('usd'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CHECK', 'OTHER']),
  reference: z.string().optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
})

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type ManualPaymentInput = z.infer<typeof manualPaymentSchema>

// ===================================================
// Service Functions
// ===================================================

/**
 * Create a Stripe Checkout Session and record it in the database.
 */
export async function createCheckoutSession(input: CreateCheckoutInput) {
  // Verify customer exists
  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, isDeleted: false },
    select: { id: true, fullName: true, email: true },
  })
  if (!customer) throw new ServiceError('Customer not found', 404)

  // Verify appointment if provided
  if (input.appointmentId) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: input.appointmentId, isDeleted: false },
      select: { id: true },
    })
    if (!appointment) throw new ServiceError('Appointment not found', 404)
  }

  // Create the Stripe Checkout Session with idempotency key
  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: input.currency,
            product_data: {
              name: input.description ?? 'Spa Service Payment',
            },
            unit_amount: Math.round(input.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        customerId: input.customerId,
        appointmentId: input.appointmentId ?? '',
      },
      customer_email: customer.email ?? undefined,
    },
    {
      idempotencyKey: input.idempotencyKey,
    }
  )

  // Record the transaction in the database immediately (status: pending)
  await prisma.transaction.create({
    data: {
      type: 'INCOME',
      amount: new Prisma.Decimal(input.amount),
      currency: input.currency.toUpperCase(),
      category: 'SERVICE_PAYMENT',
      description: input.description ?? 'Stripe Checkout Payment',
      paymentMethod: 'STRIPE',
      stripeSessionId: session.id,
      customerId: input.customerId,
      appointmentId: input.appointmentId ?? null,
      idempotencyKey: input.idempotencyKey,
      status: 'PENDING',
      date: new Date(),
      notes: `Stripe session: ${session.id}`,
    },
  })

  return {
    sessionId: session.id,
    url: session.url,
  }
}

/**
 * Create a Stripe PaymentIntent for inline payment form.
 */
export async function createPaymentIntent(input: CreatePaymentIntentInput) {
  // Verify customer exists
  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, isDeleted: false },
    select: { id: true, fullName: true },
  })
  if (!customer) throw new ServiceError('Customer not found', 404)

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: Math.round(input.amount * 100), // Convert to cents
      currency: input.currency,
      metadata: {
        customerId: input.customerId,
        appointmentId: input.appointmentId ?? '',
      },
      description: input.description ?? `Payment for ${customer.fullName}`,
    },
    {
      idempotencyKey: input.idempotencyKey,
    }
  )

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  }
}

/**
 * Record a manual (non-Stripe) payment.
 */
export async function recordManualPayment(input: ManualPaymentInput) {
  // Verify customer exists
  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, isDeleted: false },
    select: { id: true, fullName: true },
  })
  if (!customer) throw new ServiceError('Customer not found', 404)

  // Verify appointment if provided
  if (input.appointmentId) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: input.appointmentId, isDeleted: false },
      select: { id: true },
    })
    if (!appointment) throw new ServiceError('Appointment not found', 404)
  }

  // Create the transaction record
  const transaction = await prisma.transaction.create({
    data: {
      type: 'INCOME',
      amount: new Prisma.Decimal(input.amount),
      currency: input.currency.toUpperCase(),
      category: 'SERVICE_PAYMENT',
      description: input.description ?? `Manual payment from ${customer.fullName}`,
      paymentMethod: input.paymentMethod,
      customerId: input.customerId,
      appointmentId: input.appointmentId ?? null,
      date: new Date(),
      notes: input.notes ?? null,
    },
    select: {
      id: true,
      type: true,
      amount: true,
      currency: true,
      category: true,
      description: true,
      paymentMethod: true,
      date: true,
      createdAt: true,
    },
  })

  // Update appointment payment status if provided
  if (input.appointmentId) {
    await prisma.appointment.update({
      where: { id: input.appointmentId },
      data: {
        paymentStatus: 'paid',
        paymentAmount: new Prisma.Decimal(input.amount),
      },
    })
  }

  return transaction
}

/**
 * Handle Stripe webhook events.
 * All business logic for payment status changes goes here.
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.metadata?.customerId
      const appointmentId = session.metadata?.appointmentId

      // Update appointment payment status
      if (appointmentId) {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            paymentStatus: 'paid',
            paymentAmount: session.amount_total
              ? new Prisma.Decimal(session.amount_total / 100)
              : null,
          },
        })
      }

      // Update the transaction record to reflect completion
      if (session.id) {
        await prisma.transaction.updateMany({
          where: { stripeSessionId: session.id },
          data: {
            status: 'COMPLETED',
            notes: `Stripe session completed. Customer: ${customerId ?? 'unknown'}`,
          },
        })
      }
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const appointmentId = paymentIntent.metadata?.appointmentId
      const customerId = paymentIntent.metadata?.customerId

      if (appointmentId) {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            paymentStatus: 'paid',
            paymentAmount: new Prisma.Decimal(paymentIntent.amount / 100),
          },
        })
      }

      // Create a transaction record for inline payment
      await prisma.transaction.create({
        data: {
          type: 'INCOME',
          amount: new Prisma.Decimal(paymentIntent.amount / 100),
          currency: paymentIntent.currency.toUpperCase(),
          category: 'SERVICE_PAYMENT',
          description: paymentIntent.description ?? 'Stripe Payment',
          paymentMethod: 'STRIPE',
          stripePaymentIntentId: paymentIntent.id,
          customerId: customerId ?? null,
          appointmentId: appointmentId ?? null,
          date: new Date(),
          notes: `Payment Intent succeeded: ${paymentIntent.id}`,
        },
      })
      break
    }

    case 'payment_intent.payment_failed': {
      const failedIntent = event.data.object as Stripe.PaymentIntent
      const failedAppointmentId = failedIntent.metadata?.appointmentId

      if (failedAppointmentId) {
        await prisma.appointment.update({
          where: { id: failedAppointmentId },
          data: {
            paymentStatus: 'failed',
          },
        })
      }
      break
    }

    default:
      // Unhandled event type -- log but do not error
      break
  }
}
