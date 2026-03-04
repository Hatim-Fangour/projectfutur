'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { financeApi } from '@/lib/api-client'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { SkeletonPageHeader, SkeletonStatCards, SkeletonTable } from '@/components/ui/skeleton-luxury'
import { LuxuryBadge } from '@/components/ui/luxury-badge'
import {
  DollarSign, Loader2, Plus, TrendingDown, TrendingUp, Pencil, Trash2, Target, Banknote,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import ManualPaymentForm from '@/components/payments/ManualPaymentForm'

// Types
interface Transaction {
  id: string; type: string; category: string; amount: string; currency: string
  description: string | null; date: string; paymentMethod: string; status: string
}
interface FinanceOverview {
  totalIncome: number; totalExpenses: number; profit: number
  incomeByCategory: Record<string, number>; expenseByCategory: Record<string, number>
}
interface Budget {
  id: string; category: string; amount: string; spent: string; period: string
  startDate: string; endDate: string; notes: string | null
}
interface SavingsGoal {
  id: string; name: string; description: string | null; targetAmount: string
  currentAmount: string; deadline: string | null; status: string
}

type TxFormData = {
  type: string; category: string; amount: string; description: string
  date: string; paymentMethod: string
}
const emptyTxForm: TxFormData = { type: 'INCOME', category: '', amount: '', description: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'CASH' }

type BudgetFormData = { category: string; amount: string; period: string; startDate: string; endDate: string; notes: string }
const emptyBudgetForm: BudgetFormData = { category: '', amount: '', period: 'MONTHLY', startDate: '', endDate: '', notes: '' }

type SavingsFormData = { name: string; description: string; targetAmount: string; currentAmount: string; deadline: string }
const emptySavingsForm: SavingsFormData = { name: '', description: '', targetAmount: '', currentAmount: '0', deadline: '' }

function formatCurrency(v: number | string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(v))
}

export default function FinanceManagementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [overview, setOverview] = useState<FinanceOverview | null>(null)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [savings, setSavings] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  // Transaction dialog
  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [txForm, setTxForm] = useState<TxFormData>(emptyTxForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<'tx' | 'budget' | 'savings'>('tx')

  // Budget dialog
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [budgetForm, setBudgetForm] = useState<BudgetFormData>(emptyBudgetForm)

  // Savings dialog
  const [savingsDialogOpen, setSavingsDialogOpen] = useState(false)
  const [editingSavings, setEditingSavings] = useState<SavingsGoal | null>(null)
  const [savingsForm, setSavingsForm] = useState<SavingsFormData>(emptySavingsForm)

  // Payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [txRes, ovRes, budRes, savRes] = await Promise.all([
        financeApi.transactions.list({ limit: 50 }),
        financeApi.overview(),
        financeApi.budgets.list(),
        financeApi.savings.list(),
      ])
      if (txRes.success && txRes.data) setTransactions(txRes.data as Transaction[])
      if (ovRes.success && ovRes.data) setOverview(ovRes.data as FinanceOverview)
      if (budRes.success && budRes.data) setBudgets(budRes.data as Budget[])
      if (savRes.success && savRes.data) setSavings(savRes.data as SavingsGoal[])
    } catch { toast.error('Failed to load financial data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Transaction handlers
  const openCreateTx = (type: string) => { setEditingTx(null); setTxForm({ ...emptyTxForm, type }); setTxDialogOpen(true) }
  const openEditTx = (tx: Transaction) => {
    setEditingTx(tx)
    setTxForm({ type: tx.type, category: tx.category, amount: tx.amount, description: tx.description ?? '', date: tx.date.slice(0, 10), paymentMethod: tx.paymentMethod })
    setTxDialogOpen(true)
  }

  const handleTxSubmit = async () => {
    if (!txForm.category.trim() || !txForm.amount) { toast.error('Category and amount required'); return }
    setSubmitting(true)
    try {
      const payload = {
        type: txForm.type, category: txForm.category.trim(), amount: parseFloat(txForm.amount),
        description: txForm.description.trim() || null, date: new Date(txForm.date).toISOString(),
        paymentMethod: txForm.paymentMethod,
      }
      if (editingTx) {
        const res = await financeApi.transactions.update(editingTx.id, payload)
        if (res.success) { toast.success('Transaction updated'); setTxDialogOpen(false); fetchAll() }
        else toast.error(res.error ?? 'Failed')
      } else {
        const res = await financeApi.transactions.create(payload)
        if (res.success) { toast.success('Transaction created'); setTxDialogOpen(false); fetchAll() }
        else toast.error(res.error ?? 'Failed')
      }
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  // Budget handlers
  const openCreateBudget = () => { setEditingBudget(null); setBudgetForm(emptyBudgetForm); setBudgetDialogOpen(true) }
  const openEditBudget = (b: Budget) => {
    setEditingBudget(b)
    setBudgetForm({ category: b.category, amount: b.amount, period: b.period, startDate: b.startDate.slice(0, 10), endDate: b.endDate.slice(0, 10), notes: b.notes ?? '' })
    setBudgetDialogOpen(true)
  }

  const handleBudgetSubmit = async () => {
    if (!budgetForm.category.trim() || !budgetForm.amount) { toast.error('Category and amount required'); return }
    setSubmitting(true)
    try {
      const payload = {
        category: budgetForm.category.trim(), amount: parseFloat(budgetForm.amount), period: budgetForm.period,
        startDate: new Date(budgetForm.startDate).toISOString(), endDate: new Date(budgetForm.endDate).toISOString(),
        notes: budgetForm.notes.trim() || null,
      }
      if (editingBudget) {
        const res = await financeApi.budgets.update(editingBudget.id, payload)
        if (res.success) { toast.success('Budget updated'); setBudgetDialogOpen(false); fetchAll() }
        else toast.error(res.error ?? 'Failed')
      } else {
        const res = await financeApi.budgets.create(payload)
        if (res.success) { toast.success('Budget created'); setBudgetDialogOpen(false); fetchAll() }
        else toast.error(res.error ?? 'Failed')
      }
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  // Savings handlers
  const openCreateSavings = () => { setEditingSavings(null); setSavingsForm(emptySavingsForm); setSavingsDialogOpen(true) }
  const openEditSavings = (s: SavingsGoal) => {
    setEditingSavings(s)
    setSavingsForm({ name: s.name, description: s.description ?? '', targetAmount: s.targetAmount, currentAmount: s.currentAmount, deadline: s.deadline?.slice(0, 10) ?? '' })
    setSavingsDialogOpen(true)
  }

  const handleSavingsSubmit = async () => {
    if (!savingsForm.name.trim() || !savingsForm.targetAmount) { toast.error('Name and target amount required'); return }
    setSubmitting(true)
    try {
      const payload = {
        name: savingsForm.name.trim(), description: savingsForm.description.trim() || null,
        targetAmount: parseFloat(savingsForm.targetAmount), currentAmount: parseFloat(savingsForm.currentAmount) || 0,
        deadline: savingsForm.deadline ? new Date(savingsForm.deadline).toISOString() : null,
      }
      if (editingSavings) {
        const res = await financeApi.savings.update(editingSavings.id, payload)
        if (res.success) { toast.success('Goal updated'); setSavingsDialogOpen(false); fetchAll() }
        else toast.error(res.error ?? 'Failed')
      } else {
        const res = await financeApi.savings.create(payload)
        if (res.success) { toast.success('Goal created'); setSavingsDialogOpen(false); fetchAll() }
        else toast.error(res.error ?? 'Failed')
      }
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  // Delete handler
  const openDeleteDialog = (id: string, type: 'tx' | 'budget' | 'savings') => { setDeletingId(id); setDeleteType(type); setDeleteDialogOpen(true) }
  const handleDelete = async () => {
    if (!deletingId) return
    setSubmitting(true)
    try {
      let res
      if (deleteType === 'tx') res = await financeApi.transactions.delete(deletingId)
      else if (deleteType === 'budget') res = await financeApi.budgets.delete(deletingId)
      else res = await financeApi.savings.delete(deletingId)
      if (res.success) { toast.success('Deleted successfully'); setDeleteDialogOpen(false); fetchAll() }
      else toast.error(res.error ?? 'Delete failed')
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-6">
        <SkeletonPageHeader />
        <SkeletonStatCards count={3} />
        <SkeletonTable rows={5} cols={6} />
      </div>
    )
  }

  const totalIncome = overview?.totalIncome ?? 0
  const totalExpenses = overview?.totalExpenses ?? 0
  const profit = overview?.profit ?? 0

  return (
    <div className="space-y-6 pb-6 animate-fade-in-up">
      <PageHeader
        title="Financial Management"
        subtitle="Track income, expenses, budgets, and savings"
        actions={
          <>
            <Button variant="secondary" onClick={() => setPaymentDialogOpen(true)}><Banknote className="w-4 h-4 mr-2" /> Record Payment</Button>
            <Button variant="outline" onClick={() => openCreateTx('EXPENSE')}><TrendingDown className="w-4 h-4 mr-2" /> Add Expense</Button>
            <Button onClick={() => openCreateTx('INCOME')}><TrendingUp className="w-4 h-4 mr-2" /> Add Income</Button>
          </>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <StatCard
          label="Total Income"
          value={formatCurrency(totalIncome)}
          trendPositive={true}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          trendPositive={false}
          icon={TrendingDown}
        />
        <StatCard
          label="Net Profit"
          value={formatCurrency(profit)}
          trendPositive={profit >= 0}
          icon={DollarSign}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
          <TabsTrigger value="budgets">Budgets ({budgets.length})</TabsTrigger>
          <TabsTrigger value="savings">Savings ({savings.length})</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
              <p className="text-muted-foreground mb-4">Record your first income or expense.</p>
              <Button onClick={() => openCreateTx('INCOME')}><Plus className="w-4 h-4 mr-2" /> Add Transaction</Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                      <TableCell><LuxuryBadge variant={tx.type === 'INCOME' ? 'income' : 'expense'}>{tx.type}</LuxuryBadge></TableCell>
                      <TableCell className="capitalize">{tx.category}</TableCell>
                      <TableCell className="text-muted-foreground max-w-48 truncate">{tx.description ?? '-'}</TableCell>
                      <TableCell className="capitalize text-muted-foreground">{tx.paymentMethod.replace('_', ' ').toLowerCase()}</TableCell>
                      <TableCell className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditTx(tx)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(tx.id, 'tx')}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateBudget}><Plus className="w-4 h-4 mr-2" /> Add Budget</Button>
          </div>
          {budgets.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No budgets set</h3>
              <p className="text-muted-foreground mb-4">Set budgets to track your spending.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((b) => {
                const spent = Number(b.spent)
                const budget = Number(b.amount)
                const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
                return (
                  <Card key={b.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm capitalize">{b.category}</CardTitle>
                        <Badge variant="outline">{b.period}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="font-medium">{formatCurrency(spent)} / {formatCurrency(budget)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${percent}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{percent.toFixed(0)}% used</p>
                      <div className="flex justify-end gap-1 pt-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditBudget(b)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(b.id, 'budget')}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Savings Tab */}
        <TabsContent value="savings">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateSavings}><Plus className="w-4 h-4 mr-2" /> Add Goal</Button>
          </div>
          {savings.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No savings goals</h3>
              <p className="text-muted-foreground mb-4">Set savings goals to track your progress.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savings.map((s) => {
                const current = Number(s.currentAmount)
                const target = Number(s.targetAmount)
                const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0
                return (
                  <Card key={s.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{s.name}</CardTitle>
                        <Badge variant={s.status === 'COMPLETED' ? 'default' : s.status === 'ACTIVE' ? 'secondary' : 'outline'}>{s.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{formatCurrency(current)} / {formatCurrency(target)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{percent.toFixed(0)}% complete</p>
                      {s.deadline && <p className="text-xs text-muted-foreground">Deadline: {new Date(s.deadline).toLocaleDateString()}</p>}
                      <div className="flex justify-end gap-1 pt-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditSavings(s)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(s.id, 'savings')}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Transaction Dialog */}
      <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTx ? 'Edit Transaction' : `New ${txForm.type === 'INCOME' ? 'Income' : 'Expense'}`}</DialogTitle>
            <DialogDescription>Fill in the transaction details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={txForm.type} onValueChange={(v) => setTxForm((p) => ({ ...p, type: v }))} disabled={submitting}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="txAmount">Amount *</Label>
                <Input id="txAmount" type="number" step="0.01" min="0" value={txForm.amount} onChange={(e) => setTxForm((p) => ({ ...p, amount: e.target.value }))} disabled={submitting} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="txCategory">Category *</Label>
              <Input id="txCategory" value={txForm.category} onChange={(e) => setTxForm((p) => ({ ...p, category: e.target.value }))} disabled={submitting} placeholder="e.g. Services, Rent, Supplies" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="txDate">Date</Label>
                <Input id="txDate" type="date" value={txForm.date} onChange={(e) => setTxForm((p) => ({ ...p, date: e.target.value }))} disabled={submitting} />
              </div>
              <div className="grid gap-2">
                <Label>Payment Method</Label>
                <Select value={txForm.paymentMethod} onValueChange={(v) => setTxForm((p) => ({ ...p, paymentMethod: v }))} disabled={submitting}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHECK">Check</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="txDesc">Description</Label>
              <Textarea id="txDesc" value={txForm.description} onChange={(e) => setTxForm((p) => ({ ...p, description: e.target.value }))} disabled={submitting} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTxDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleTxSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTx ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Budget Dialog */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Edit Budget' : 'New Budget'}</DialogTitle>
            <DialogDescription>Set a spending budget for a category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="budgetCategory">Category *</Label>
              <Input id="budgetCategory" value={budgetForm.category} onChange={(e) => setBudgetForm((p) => ({ ...p, category: e.target.value }))} disabled={submitting} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budgetAmount">Amount *</Label>
                <Input id="budgetAmount" type="number" step="0.01" min="0" value={budgetForm.amount} onChange={(e) => setBudgetForm((p) => ({ ...p, amount: e.target.value }))} disabled={submitting} />
              </div>
              <div className="grid gap-2">
                <Label>Period</Label>
                <Select value={budgetForm.period} onValueChange={(v) => setBudgetForm((p) => ({ ...p, period: v }))} disabled={submitting}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budgetStart">Start Date</Label>
                <Input id="budgetStart" type="date" value={budgetForm.startDate} onChange={(e) => setBudgetForm((p) => ({ ...p, startDate: e.target.value }))} disabled={submitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budgetEnd">End Date</Label>
                <Input id="budgetEnd" type="date" value={budgetForm.endDate} onChange={(e) => setBudgetForm((p) => ({ ...p, endDate: e.target.value }))} disabled={submitting} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budgetNotes">Notes</Label>
              <Textarea id="budgetNotes" value={budgetForm.notes} onChange={(e) => setBudgetForm((p) => ({ ...p, notes: e.target.value }))} disabled={submitting} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBudgetDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleBudgetSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingBudget ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Savings Dialog */}
      <Dialog open={savingsDialogOpen} onOpenChange={setSavingsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSavings ? 'Edit Goal' : 'New Savings Goal'}</DialogTitle>
            <DialogDescription>Set a savings target to track your progress.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="savingsName">Name *</Label>
              <Input id="savingsName" value={savingsForm.name} onChange={(e) => setSavingsForm((p) => ({ ...p, name: e.target.value }))} disabled={submitting} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="savingsTarget">Target Amount *</Label>
                <Input id="savingsTarget" type="number" step="0.01" min="0" value={savingsForm.targetAmount} onChange={(e) => setSavingsForm((p) => ({ ...p, targetAmount: e.target.value }))} disabled={submitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="savingsCurrent">Current Amount</Label>
                <Input id="savingsCurrent" type="number" step="0.01" min="0" value={savingsForm.currentAmount} onChange={(e) => setSavingsForm((p) => ({ ...p, currentAmount: e.target.value }))} disabled={submitting} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="savingsDeadline">Deadline</Label>
              <Input id="savingsDeadline" type="date" value={savingsForm.deadline} onChange={(e) => setSavingsForm((p) => ({ ...p, deadline: e.target.value }))} disabled={submitting} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="savingsDesc">Description</Label>
              <Textarea id="savingsDesc" value={savingsForm.description} onChange={(e) => setSavingsForm((p) => ({ ...p, description: e.target.value }))} disabled={submitting} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSavingsDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSavingsSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingSavings ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a manual payment from a customer (cash, bank transfer, check).</DialogDescription>
          </DialogHeader>
          <ManualPaymentForm
            onSuccess={() => {
              setPaymentDialogOpen(false)
              fetchAll()
            }}
            onCancel={() => setPaymentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
