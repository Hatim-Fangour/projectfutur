'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { inventoryApi } from '@/lib/api-client'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { SkeletonPageHeader, SkeletonStatCards, SkeletonTable } from '@/components/ui/skeleton-luxury'
import { LuxuryBadge, statusToVariant } from '@/components/ui/luxury-badge'
import {
  Archive, CircleAlert, Loader2, Package, Plus, Pencil, Search, ShoppingCart, Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface InventoryItem {
  id: string
  name: string
  category: string | null
  currentQuantity: number
  minQuantity: number
  unit: string | null
  costPerUnit: string | null
  supplierName: string | null
  supplierContact: string | null
  reorderQuantity: number | null
  notes: string | null
  status: string
  createdAt: string
}

interface InventoryFormData {
  name: string
  category: string
  currentQuantity: string
  minQuantity: string
  unit: string
  costPerUnit: string
  supplierName: string
  supplierContact: string
  reorderQuantity: string
  notes: string
}

const emptyForm: InventoryFormData = {
  name: '', category: '', currentQuantity: '0', minQuantity: '0',
  unit: '', costPerUnit: '', supplierName: '', supplierContact: '',
  reorderQuantity: '', notes: '',
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'IN_STOCK': return 'default'
    case 'LOW_STOCK': return 'secondary'
    case 'OUT_OF_STOCK': return 'destructive'
    default: return 'default'
  }
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)
  const [formData, setFormData] = useState<InventoryFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const fetchItems = useCallback(async (p = 1) => {
    try {
      setLoading(true)
      const params: Record<string, string | number> = { page: p, limit: 20 }
      if (searchTerm) params.search = searchTerm
      if (statusFilter) params.status = statusFilter
      const res = await inventoryApi.list(params as Parameters<typeof inventoryApi.list>[0])
      if (res.success && res.data) {
        setItems(res.data as InventoryItem[])
        if (res.pagination) { setTotalPages(res.pagination.pages); setPage(res.pagination.page) }
      } else { toast.error(res.error ?? 'Failed to load inventory') }
    } catch { toast.error('Failed to load inventory') } finally { setLoading(false) }
  }, [searchTerm, statusFilter])

  useEffect(() => { fetchItems() }, [fetchItems])

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    inStock: items.filter((i) => i.status === 'IN_STOCK').length,
    lowStock: items.filter((i) => i.status === 'LOW_STOCK').length,
    outOfStock: items.filter((i) => i.status === 'OUT_OF_STOCK').length,
  }), [items])

  const openCreate = () => { setEditingItem(null); setFormData(emptyForm); setDialogOpen(true) }

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category ?? '',
      currentQuantity: item.currentQuantity.toString(),
      minQuantity: item.minQuantity.toString(),
      unit: item.unit ?? '',
      costPerUnit: item.costPerUnit ?? '',
      supplierName: item.supplierName ?? '',
      supplierContact: item.supplierContact ?? '',
      reorderQuantity: item.reorderQuantity?.toString() ?? '',
      notes: item.notes ?? '',
    })
    setDialogOpen(true)
  }

  const openDelete = (item: InventoryItem) => { setDeletingItem(item); setDeleteDialogOpen(true) }

  const handleSubmit = async () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return }
    setSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim() || null,
        currentQuantity: parseInt(formData.currentQuantity) || 0,
        minQuantity: parseInt(formData.minQuantity) || 0,
        unit: formData.unit.trim() || null,
        costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : null,
        supplierName: formData.supplierName.trim() || null,
        supplierContact: formData.supplierContact.trim() || null,
        reorderQuantity: formData.reorderQuantity ? parseInt(formData.reorderQuantity) : null,
        notes: formData.notes.trim() || null,
      }
      if (editingItem) {
        const res = await inventoryApi.update(editingItem.id, payload)
        if (res.success) { toast.success('Item updated'); setDialogOpen(false); fetchItems(page) }
        else toast.error(res.error ?? 'Failed to update item')
      } else {
        const res = await inventoryApi.create(payload)
        if (res.success) { toast.success('Item created'); setDialogOpen(false); fetchItems(1) }
        else toast.error(res.error ?? 'Failed to create item')
      }
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    setSubmitting(true)
    try {
      const res = await inventoryApi.delete(deletingItem.id)
      if (res.success) { toast.success('Item deleted'); setDeleteDialogOpen(false); fetchItems(page) }
      else toast.error(res.error ?? 'Failed to delete item')
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  if (loading && items.length === 0) {
    return (
      <div className="space-y-6 pb-6">
        <SkeletonPageHeader />
        <SkeletonStatCards count={4} />
        <SkeletonTable rows={5} cols={7} />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6 animate-fade-in-up">
      <PageHeader
        title="Inventory"
        subtitle="Manage products and supplies"
        actions={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Item</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <StatCard label="Total Items" value={stats.total} icon={Archive} />
        <StatCard label="In Stock" value={stats.inStock} trendPositive={true} icon={Package} />
        <StatCard label="Low Stock" value={stats.lowStock} trendPositive={stats.lowStock === 0} icon={CircleAlert} />
        <StatCard label="Out of Stock" value={stats.outOfStock} trendPositive={stats.outOfStock === 0} icon={ShoppingCart} />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchItems(1)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="IN_STOCK">In Stock</SelectItem>
            <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => fetchItems(1)}><Search className="h-4 w-4" /></Button>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No inventory items</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first inventory item.</p>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Min Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.unit && <p className="text-xs text-muted-foreground">{item.unit}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.category ?? '-'}</TableCell>
                  <TableCell>{item.currentQuantity}</TableCell>
                  <TableCell>{item.minQuantity}</TableCell>
                  <TableCell><LuxuryBadge variant={statusToVariant(item.status)}>{item.status.replace(/_/g, ' ')}</LuxuryBadge></TableCell>
                  <TableCell className="text-muted-foreground">{item.supplierName ?? '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openDelete(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchItems(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchItems(page + 1)}>Next</Button>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
            <DialogDescription>{editingItem ? 'Update inventory item details.' : 'Add a new inventory item.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} disabled={submitting} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} disabled={submitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit (e.g. ml, pcs)</Label>
                <Input id="unit" value={formData.unit} onChange={(e) => setFormData((p) => ({ ...p, unit: e.target.value }))} disabled={submitting} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentQuantity">Current Qty</Label>
                <Input id="currentQuantity" type="number" min="0" value={formData.currentQuantity} onChange={(e) => setFormData((p) => ({ ...p, currentQuantity: e.target.value }))} disabled={submitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minQuantity">Min Qty</Label>
                <Input id="minQuantity" type="number" min="0" value={formData.minQuantity} onChange={(e) => setFormData((p) => ({ ...p, minQuantity: e.target.value }))} disabled={submitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reorderQuantity">Reorder Qty</Label>
                <Input id="reorderQuantity" type="number" min="0" value={formData.reorderQuantity} onChange={(e) => setFormData((p) => ({ ...p, reorderQuantity: e.target.value }))} disabled={submitting} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="costPerUnit">Cost Per Unit</Label>
                <Input id="costPerUnit" type="number" step="0.01" value={formData.costPerUnit} onChange={(e) => setFormData((p) => ({ ...p, costPerUnit: e.target.value }))} disabled={submitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input id="supplierName" value={formData.supplierName} onChange={(e) => setFormData((p) => ({ ...p, supplierName: e.target.value }))} disabled={submitting} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplierContact">Supplier Contact</Label>
              <Input id="supplierContact" value={formData.supplierContact} onChange={(e) => setFormData((p) => ({ ...p, supplierContact: e.target.value }))} disabled={submitting} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} disabled={submitting} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingItem?.name}</strong>? This action cannot be undone.
            </DialogDescription>
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
    </div>
  )
}
