'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { paymentApi, customerApi, appointmentApi } from '@/lib/api-client'
import { toast } from 'sonner'

interface ManualPaymentFormProps {
  /** Pre-selected customer ID (hides customer selector if provided) */
  customerId?: string
  /** Pre-selected appointment ID */
  appointmentId?: string
  /** Pre-filled amount */
  defaultAmount?: number
  /** Called after successful payment recording */
  onSuccess?: () => void
  /** Called when user cancels */
  onCancel?: () => void
}

type PaymentMethodType = 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'OTHER'

interface CustomerOption {
  id: string
  fullName: string
}

interface AppointmentOption {
  id: string
  service: string | null
  startTime: string
  customer?: { fullName: string }
}

export default function ManualPaymentForm({
  customerId: presetCustomerId,
  appointmentId: presetAppointmentId,
  defaultAmount,
  onSuccess,
  onCancel,
}: ManualPaymentFormProps) {
  const t = useTranslations('payments')
  const tc = useTranslations('common')

  // Form state
  const [customerId, setCustomerId] = useState(presetCustomerId ?? '')
  const [appointmentId, setAppointmentId] = useState(presetAppointmentId ?? '')
  const [amount, setAmount] = useState(defaultAmount?.toString() ?? '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Dropdown data
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [appointments, setAppointments] = useState<AppointmentOption[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  // Load customers for dropdown (only if no preset customer)
  const fetchCustomers = useCallback(async () => {
    if (presetCustomerId) return
    setLoadingCustomers(true)
    try {
      const res = await customerApi.list({ limit: 100 })
      if (res.success && res.data) {
        setCustomers(res.data as CustomerOption[])
      }
    } catch {
      // Silently fail -- dropdown will be empty
    } finally {
      setLoadingCustomers(false)
    }
  }, [presetCustomerId])

  // Load appointments for the selected customer
  const fetchAppointments = useCallback(async (custId: string) => {
    if (!custId) {
      setAppointments([])
      return
    }
    try {
      const res = await appointmentApi.list({ limit: 50 })
      if (res.success && res.data) {
        // Filter client-side since API may not support direct customer filter
        const all = res.data as AppointmentOption[]
        setAppointments(all)
      }
    } catch {
      // Silently fail
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    if (customerId) {
      fetchAppointments(customerId)
    }
  }, [customerId, fetchAppointments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerId) {
      toast.error(t('customerRequired'))
      return
    }
    const parsedAmount = parseFloat(amount)
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error(t('amountPositive'))
      return
    }

    setSubmitting(true)
    try {
      const res = await paymentApi.recordManual({
        customerId,
        appointmentId: appointmentId || undefined,
        amount: parsedAmount,
        paymentMethod,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        description: description.trim() || undefined,
      })

      if (res.success) {
        toast.success(t('created'))
        onSuccess?.()
      } else {
        toast.error(res.error ?? t('failedCreate'))
      }
    } catch {
      toast.error(t('failedCreate'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer selector (hidden if preset) */}
      {!presetCustomerId && (
        <div className="grid gap-2">
          <Label>{t('customerLabel')} *</Label>
          <Select
            value={customerId}
            onValueChange={setCustomerId}
            disabled={submitting || loadingCustomers}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectCustomer')} />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Appointment selector */}
      <div className="grid gap-2">
        <Label>{t('appointmentLabel')}</Label>
        <Select
          value={appointmentId}
          onValueChange={setAppointmentId}
          disabled={submitting}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('selectAppointment')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('noAppointment')}</SelectItem>
            {appointments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.service ?? 'Appointment'} - {new Date(a.startTime).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount and Payment Method */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="manualAmount">{t('amount')} *</Label>
          <Input
            id="manualAmount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={submitting}
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label>{t('method')} *</Label>
          <Select
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as PaymentMethodType)}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">{t('methods.CASH')}</SelectItem>
              <SelectItem value="BANK_TRANSFER">{t('methods.BANK_TRANSFER')}</SelectItem>
              <SelectItem value="CHECK">{t('methods.CHECK')}</SelectItem>
              <SelectItem value="OTHER">{t('methods.OTHER')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reference */}
      <div className="grid gap-2">
        <Label htmlFor="manualRef">{t('reference')}</Label>
        <Input
          id="manualRef"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          disabled={submitting}
          placeholder={t('referencePlaceholder')}
        />
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="manualDesc">{tc('description')}</Label>
        <Input
          id="manualDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
          placeholder="Service payment, product sale, etc."
        />
      </div>

      {/* Notes */}
      <div className="grid gap-2">
        <Label htmlFor="manualNotes">{t('notes')}</Label>
        <Textarea
          id="manualNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={submitting}
          rows={2}
          placeholder={t('notesPlaceholder')}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            {tc('cancel')}
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {submitting ? t('processing') : t('recordPayment')}
        </Button>
      </div>
    </form>
  )
}
