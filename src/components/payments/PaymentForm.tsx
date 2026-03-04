'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { paymentApi } from '@/lib/api-client'
import { toast } from 'sonner'

// Load Stripe outside component to avoid re-initialization
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
)

interface PaymentFormProps {
  customerId: string
  appointmentId?: string
  amount: number
  currency?: string
  description?: string
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * Inner form rendered inside the Stripe Elements provider.
 */
function PaymentFormInner({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const t = useTranslations('payments')
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setProcessing(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}?payment=success`,
      },
    })

    if (error) {
      toast.error(error.message ?? t('failed'))
      setProcessing(false)
    } else {
      toast.success(t('success'))
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
            {t('cancel' as 'title')}
          </Button>
        )}
        <Button type="submit" disabled={!stripe || processing}>
          {processing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {processing ? t('processing') : t('payNow')}
        </Button>
      </div>
    </form>
  )
}

/**
 * Stripe Elements payment form.
 * Creates a PaymentIntent on mount and renders the Stripe PaymentElement.
 */
export default function PaymentForm({
  customerId,
  appointmentId,
  amount,
  currency = 'usd',
  description,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const t = useTranslations('payments')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializePayment = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const idempotencyKey = `intent_${customerId}_${Date.now()}`
      const res = await paymentApi.createIntent({
        customerId,
        appointmentId,
        amount,
        currency,
        description,
        idempotencyKey,
      })

      if (res.success && res.data?.clientSecret) {
        setClientSecret(res.data.clientSecret)
      } else {
        setError(res.error ?? t('failedCreate'))
      }
    } catch {
      setError(t('failedCreate'))
    } finally {
      setLoading(false)
    }
  }, [customerId, appointmentId, amount, currency, description, t])

  // Initialize on first render
  if (!clientSecret && !loading && !error) {
    initializePayment()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={initializePayment}>
          {t('payNow')}
        </Button>
      </div>
    )
  }

  if (!clientSecret) return null

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: 'stripe' },
      }}
    >
      <PaymentFormInner onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  )
}
