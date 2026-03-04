'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { financeApi } from '@/lib/api-client'
import { DollarSign, RefreshCcw } from 'lucide-react'

interface PaymentHistoryProps {
  /** Filter transactions by customer ID */
  customerId?: string
  /** Max rows to show (defaults to 20) */
  limit?: number
  /** Whether to show a compact view (fewer columns) */
  compact?: boolean
}

interface TransactionRow {
  id: string
  type: string
  category: string
  amount: string
  currency: string
  description: string | null
  date: string
  paymentMethod: string
  status: string
  customerId: string | null
}

function formatCurrency(value: number | string, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(Number(value))
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'COMPLETED':
      return 'default'
    case 'PENDING':
      return 'secondary'
    case 'CANCELLED':
    case 'REFUNDED':
      return 'outline'
    default:
      return 'secondary'
  }
}

export default function PaymentHistory({
  customerId,
  limit = 20,
  compact = false,
}: PaymentHistoryProps) {
  const t = useTranslations('payments')
  const tf = useTranslations('finance')

  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: {
        limit: number
        type: string
        customerId?: string
      } = {
        limit,
        type: 'INCOME',
      }
      if (customerId) {
        params.customerId = customerId
      }
      const res = await financeApi.transactions.list(params)
      if (res.success && res.data) {
        setTransactions(res.data as TransactionRow[])
      } else {
        setError(res.error ?? t('failedLoad'))
      }
    } catch {
      setError(t('failedLoad'))
    } finally {
      setLoading(false)
    }
  }, [customerId, limit, t])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-destructive mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchHistory}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          {t('payNow')}
        </Button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">{t('noPayments')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tf('transactionDate')}</TableHead>
            {!compact && <TableHead>{tf('transactionCategory')}</TableHead>}
            <TableHead>{tf('transactionDescription')}</TableHead>
            <TableHead>{t('method')}</TableHead>
            <TableHead>{t('status.COMPLETED' as 'title')}</TableHead>
            <TableHead className="text-right">{t('amount')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="whitespace-nowrap">
                {new Date(tx.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              {!compact && (
                <TableCell className="capitalize">{tx.category}</TableCell>
              )}
              <TableCell className="text-muted-foreground max-w-48 truncate">
                {tx.description ?? '-'}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {tf(`paymentMethods.${tx.paymentMethod}` as 'title')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(tx.status)}>
                  {t(`status.${tx.status}` as 'title')}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-green-600">
                +{formatCurrency(tx.amount, tx.currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
