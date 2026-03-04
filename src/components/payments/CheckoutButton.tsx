'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { paymentApi } from '@/lib/api-client'
import { toast } from 'sonner'

interface CheckoutButtonProps {
  customerId: string
  appointmentId?: string
  amount: number
  currency?: string
  description?: string
  className?: string
}

/**
 * Button that initiates a Stripe Checkout Session.
 * Redirects the user to Stripe's hosted payment page.
 */
export default function CheckoutButton({
  customerId,
  appointmentId,
  amount,
  currency = 'usd',
  description,
  className,
}: CheckoutButtonProps) {
  const t = useTranslations('payments')
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const baseUrl = window.location.origin
      const idempotencyKey = `checkout_${customerId}_${Date.now()}`

      const res = await paymentApi.createCheckout({
        customerId,
        appointmentId,
        amount,
        currency,
        description,
        successUrl: `${baseUrl}?payment=success`,
        cancelUrl: `${baseUrl}?payment=cancelled`,
        idempotencyKey,
      })

      if (res.success && res.data?.url) {
        toast.success(t('checkoutCreated'))
        window.location.href = res.data.url
      } else {
        toast.error(res.error ?? t('failedCreate'))
      }
    } catch {
      toast.error(t('failedCreate'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} className={className}>
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      {loading ? t('processing') : t('stripeCheckout')}
    </Button>
  )
}
