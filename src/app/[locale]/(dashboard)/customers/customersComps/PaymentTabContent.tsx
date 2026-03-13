'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreditCard, Banknote, Receipt } from 'lucide-react'
import { PaymentHistory } from '@/components/payments'
import ManualPaymentForm from '@/components/payments/ManualPaymentForm'
import CheckoutButton from '@/components/payments/CheckoutButton'
import type { Customer } from '@/app/[locale]/(dashboard)/customers/types/customers'

interface PaymentTabContentProps {
  customer: Customer
}

export default function PaymentTabContent({ customer }: PaymentTabContentProps) {
  const t = useTranslations('payments')

  const [manualDialogOpen, setManualDialogOpen] = useState(false)
  const [stripeDialogOpen, setStripeDialogOpen] = useState(false)
  const [stripeAmount, setStripeAmount] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleManualSuccess = () => {
    setManualDialogOpen(false)
    // Trigger refresh of payment history
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setManualDialogOpen(true)}>
          <Banknote className="h-4 w-4 mr-2" />
          {t('manualRecord')}
        </Button>
        <Button variant="outline" onClick={() => setStripeDialogOpen(true)}>
          <CreditCard className="h-4 w-4 mr-2" />
          {t('cardPayment')}
        </Button>
      </div>

      {/* Payment History */}
      <div>
        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {t('paymentHistory')}
        </h3>
        <PaymentHistory key={refreshKey} customerId={customer.id} />
      </div>

      {/* Manual Payment Dialog */}
      <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('manualPayment')}</DialogTitle>
            <DialogDescription>
              {t('manualRecord')} - {customer.fullName}
            </DialogDescription>
          </DialogHeader>
          <ManualPaymentForm
            customerId={customer.id}
            onSuccess={handleManualSuccess}
            onCancel={() => setManualDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Stripe Payment Dialog */}
      <Dialog open={stripeDialogOpen} onOpenChange={setStripeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('cardPayment')}</DialogTitle>
            <DialogDescription>
              {t('checkout')} - {customer.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="stripeAmount" className="text-sm font-medium">
                {t('amount')} *
              </label>
              <input
                id="stripeAmount"
                type="number"
                step="0.01"
                min="0.01"
                value={stripeAmount}
                onChange={(e) => setStripeAmount(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="0.00"
              />
            </div>
            {parseFloat(stripeAmount) > 0 && (
              <CheckoutButton
                customerId={customer.id}
                amount={parseFloat(stripeAmount)}
                description={`Payment for ${customer.fullName}`}
                className="w-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
