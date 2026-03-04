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
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { serviceApi } from '@/lib/api-client'
import { PageHeader } from '@/components/ui/page-header'
import { SkeletonPageHeader, SkeletonCards } from '@/components/ui/skeleton-luxury'
import {
  DollarSign, Folder, Loader2, Package, Pencil, Plus, Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Category { id: string; name: string; description: string | null; color: string | null; icon: string | null; isActive: boolean; createdAt: string }
interface ServiceItem { id: string; categoryId: string; title: string; description: string | null; duration: number | null; isActive: boolean; category: { id: string; name: string } }
interface PricingPlan { id: string; serviceItemId: string | null; name: string; description: string | null; price: string; currency: string; billingType: string; duration: number | null; isActive: boolean }

type CategoryFormData = { name: string; description: string; color: string }
type ItemFormData = { categoryId: string; title: string; description: string; duration: string }
type PricingFormData = { serviceItemId: string; name: string; description: string; price: string; billingType: string; duration: string }

const emptyCatForm: CategoryFormData = { name: '', description: '', color: '' }
const emptyItemForm: ItemFormData = { categoryId: '', title: '', description: '', duration: '' }
const emptyPricingForm: PricingFormData = { serviceItemId: '', name: '', description: '', price: '', billingType: 'SINGLE', duration: '' }

function formatCurrency(v: number | string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v))
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<ServiceItem[]>([])
  const [pricing, setPricing] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)

  // Category dialog
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [catForm, setCatForm] = useState<CategoryFormData>(emptyCatForm)

  // Item dialog
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null)
  const [itemForm, setItemForm] = useState<ItemFormData>(emptyItemForm)

  // Pricing dialog
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false)
  const [editingPricing, setEditingPricing] = useState<PricingPlan | null>(null)
  const [pricingForm, setPricingForm] = useState<PricingFormData>(emptyPricingForm)

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<'category' | 'item' | 'pricing'>('category')
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [catRes, itemRes, pricingRes] = await Promise.all([
        serviceApi.categories.list(),
        serviceApi.items.list({ limit: 100 }),
        serviceApi.pricing.list(),
      ])
      if (catRes.success && catRes.data) setCategories(catRes.data as Category[])
      if (itemRes.success && itemRes.data) setItems(itemRes.data as ServiceItem[])
      if (pricingRes.success && pricingRes.data) setPricing(pricingRes.data as PricingPlan[])
    } catch { toast.error('Failed to load services') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Category handlers
  const openCreateCat = () => { setEditingCat(null); setCatForm(emptyCatForm); setCatDialogOpen(true) }
  const openEditCat = (c: Category) => { setEditingCat(c); setCatForm({ name: c.name, description: c.description ?? '', color: c.color ?? '' }); setCatDialogOpen(true) }
  const handleCatSubmit = async () => {
    if (!catForm.name.trim()) { toast.error('Name is required'); return }
    setSubmitting(true)
    try {
      const payload = { name: catForm.name.trim(), description: catForm.description.trim() || null, color: catForm.color.trim() || null }
      if (editingCat) {
        const res = await serviceApi.categories.update(editingCat.id, payload)
        if (res.success) { toast.success('Category updated'); setCatDialogOpen(false); fetchAll() } else toast.error(res.error ?? 'Failed')
      } else {
        const res = await serviceApi.categories.create(payload)
        if (res.success) { toast.success('Category created'); setCatDialogOpen(false); fetchAll() } else toast.error(res.error ?? 'Failed')
      }
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  // Item handlers
  const openCreateItem = (categoryId?: string) => { setEditingItem(null); setItemForm({ ...emptyItemForm, categoryId: categoryId ?? '' }); setItemDialogOpen(true) }
  const openEditItem = (item: ServiceItem) => { setEditingItem(item); setItemForm({ categoryId: item.categoryId, title: item.title, description: item.description ?? '', duration: item.duration?.toString() ?? '' }); setItemDialogOpen(true) }
  const handleItemSubmit = async () => {
    if (!itemForm.title.trim() || !itemForm.categoryId) { toast.error('Title and category required'); return }
    setSubmitting(true)
    try {
      const payload = { categoryId: itemForm.categoryId, title: itemForm.title.trim(), description: itemForm.description.trim() || null, duration: itemForm.duration ? parseInt(itemForm.duration) : null }
      if (editingItem) {
        const res = await serviceApi.items.update(editingItem.id, payload)
        if (res.success) { toast.success('Service updated'); setItemDialogOpen(false); fetchAll() } else toast.error(res.error ?? 'Failed')
      } else {
        const res = await serviceApi.items.create(payload)
        if (res.success) { toast.success('Service created'); setItemDialogOpen(false); fetchAll() } else toast.error(res.error ?? 'Failed')
      }
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  // Pricing handlers
  const openCreatePricing = (serviceItemId?: string) => { setEditingPricing(null); setPricingForm({ ...emptyPricingForm, serviceItemId: serviceItemId ?? '' }); setPricingDialogOpen(true) }
  const openEditPricing = (p: PricingPlan) => { setEditingPricing(p); setPricingForm({ serviceItemId: p.serviceItemId ?? '', name: p.name, description: p.description ?? '', price: p.price, billingType: p.billingType, duration: p.duration?.toString() ?? '' }); setPricingDialogOpen(true) }
  const handlePricingSubmit = async () => {
    if (!pricingForm.name.trim() || !pricingForm.price) { toast.error('Name and price required'); return }
    setSubmitting(true)
    try {
      const payload = { serviceItemId: pricingForm.serviceItemId || null, name: pricingForm.name.trim(), description: pricingForm.description.trim() || null, price: parseFloat(pricingForm.price), billingType: pricingForm.billingType, duration: pricingForm.duration ? parseInt(pricingForm.duration) : null }
      if (editingPricing) {
        const res = await serviceApi.pricing.update(editingPricing.id, payload)
        if (res.success) { toast.success('Pricing updated'); setPricingDialogOpen(false); fetchAll() } else toast.error(res.error ?? 'Failed')
      } else {
        const res = await serviceApi.pricing.create(payload)
        if (res.success) { toast.success('Pricing created'); setPricingDialogOpen(false); fetchAll() } else toast.error(res.error ?? 'Failed')
      }
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  // Delete
  const openDelete = (id: string, type: 'category' | 'item' | 'pricing') => { setDeletingId(id); setDeleteType(type); setDeleteDialogOpen(true) }
  const handleDelete = async () => {
    if (!deletingId) return
    setSubmitting(true)
    try {
      let res
      if (deleteType === 'category') res = await serviceApi.categories.delete(deletingId)
      else if (deleteType === 'item') res = await serviceApi.items.delete(deletingId)
      else res = await serviceApi.pricing.delete(deletingId)
      if (res.success) { toast.success('Deleted'); setDeleteDialogOpen(false); fetchAll() } else toast.error(res.error ?? 'Failed')
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-6">
        <SkeletonPageHeader />
        <SkeletonCards count={3} />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6 animate-fade-in-up">
      <PageHeader
        title="Services"
        subtitle="Manage service categories, items, and pricing"
        actions={
          <>
            <Button variant="outline" onClick={openCreateCat}><Folder className="w-4 h-4 mr-2" /> Add Category</Button>
            <Button onClick={() => openCreateItem()}><Plus className="w-4 h-4 mr-2" /> Add Service</Button>
          </>
        }
      />

      {/* Service Catalog */}
      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">Service Catalog</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Plans ({pricing.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No service categories</h3>
              <p className="text-muted-foreground mb-4">Start by creating a category, then add services.</p>
              <Button onClick={openCreateCat}><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {categories.map((cat) => {
                const catItems = items.filter((i) => i.categoryId === cat.id)
                return (
                  <AccordionItem key={cat.id} value={cat.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        {cat.color && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />}
                        <div className="text-left">
                          <p className="font-semibold">{cat.name}</p>
                          {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                        </div>
                        <Badge variant="secondary" className="ml-2">{catItems.length} services</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Services in this category</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditCat(cat)}><Pencil className="h-3 w-3 mr-1" /> Edit Category</Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openDelete(cat.id, 'category')}><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                            <Button variant="outline" size="sm" onClick={() => openCreateItem(cat.id)}><Plus className="h-3 w-3 mr-1" /> Add Service</Button>
                          </div>
                        </div>
                        {catItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No services in this category</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {catItems.map((item) => {
                              const itemPricing = pricing.filter((p) => p.serviceItemId === item.id)
                              return (
                                <Card key={item.id} className="hover:shadow-sm transition-shadow">
                                  <CardContent className="pt-4 space-y-2">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="font-medium">{item.title}</p>
                                        {item.duration && <p className="text-xs text-muted-foreground">{item.duration} min</p>}
                                      </div>
                                      <Badge variant={item.isActive ? 'default' : 'secondary'}>{item.isActive ? 'Active' : 'Inactive'}</Badge>
                                    </div>
                                    {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
                                    {itemPricing.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {itemPricing.map((p) => (
                                          <Badge key={p.id} variant="outline" className="text-xs">
                                            {p.name}: {formatCurrency(p.price)}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    <div className="flex justify-end gap-1">
                                      <Button variant="ghost" size="sm" onClick={() => openCreatePricing(item.id)}><DollarSign className="h-3 w-3 mr-1" /> Price</Button>
                                      <Button variant="ghost" size="sm" onClick={() => openEditItem(item)}><Pencil className="h-3 w-3" /></Button>
                                      <Button variant="ghost" size="sm" onClick={() => openDelete(item.id, 'item')}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="pricing">
          <div className="flex justify-end mb-4">
            <Button onClick={() => openCreatePricing()}><Plus className="w-4 h-4 mr-2" /> Add Pricing Plan</Button>
          </div>
          {pricing.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No pricing plans</h3>
              <p className="text-muted-foreground mb-4">Add pricing plans to your services.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pricing.map((p) => (
                <Card key={p.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{p.name}</CardTitle>
                      <Badge variant="outline">{p.billingType}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-2xl font-bold">{formatCurrency(p.price)}</p>
                    {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                    {p.duration && <p className="text-xs text-muted-foreground">{p.duration} min</p>}
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditPricing(p)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => openDelete(p.id, 'pricing')}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Edit Category' : 'New Category'}</DialogTitle>
            <DialogDescription>Organize your services into categories.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label htmlFor="catName">Name *</Label><Input id="catName" value={catForm.name} onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))} disabled={submitting} /></div>
            <div className="grid gap-2"><Label htmlFor="catDesc">Description</Label><Textarea id="catDesc" value={catForm.description} onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))} disabled={submitting} rows={2} /></div>
            <div className="grid gap-2"><Label htmlFor="catColor">Color (hex)</Label><Input id="catColor" type="color" value={catForm.color || '#6366f1'} onChange={(e) => setCatForm((p) => ({ ...p, color: e.target.value }))} disabled={submitting} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleCatSubmit} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingCat ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Service' : 'New Service'}</DialogTitle>
            <DialogDescription>Service details and configuration.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Category *</Label>
              <Select value={itemForm.categoryId} onValueChange={(v) => setItemForm((p) => ({ ...p, categoryId: v }))} disabled={submitting}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label htmlFor="itemTitle">Title *</Label><Input id="itemTitle" value={itemForm.title} onChange={(e) => setItemForm((p) => ({ ...p, title: e.target.value }))} disabled={submitting} /></div>
            <div className="grid gap-2"><Label htmlFor="itemDesc">Description</Label><Textarea id="itemDesc" value={itemForm.description} onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))} disabled={submitting} rows={3} /></div>
            <div className="grid gap-2"><Label htmlFor="itemDuration">Duration (minutes)</Label><Input id="itemDuration" type="number" min="0" value={itemForm.duration} onChange={(e) => setItemForm((p) => ({ ...p, duration: e.target.value }))} disabled={submitting} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleItemSubmit} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingItem ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricing Dialog */}
      <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPricing ? 'Edit Pricing' : 'New Pricing Plan'}</DialogTitle>
            <DialogDescription>Set pricing for a service.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Service (optional)</Label>
              <Select value={pricingForm.serviceItemId} onValueChange={(v) => setPricingForm((p) => ({ ...p, serviceItemId: v === 'none' ? '' : v }))} disabled={submitting}>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific service</SelectItem>
                  {items.map((i) => <SelectItem key={i.id} value={i.id}>{i.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label htmlFor="priceName">Plan Name *</Label><Input id="priceName" value={pricingForm.name} onChange={(e) => setPricingForm((p) => ({ ...p, name: e.target.value }))} disabled={submitting} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label htmlFor="priceAmount">Price *</Label><Input id="priceAmount" type="number" step="0.01" min="0" value={pricingForm.price} onChange={(e) => setPricingForm((p) => ({ ...p, price: e.target.value }))} disabled={submitting} /></div>
              <div className="grid gap-2">
                <Label>Billing Type</Label>
                <Select value={pricingForm.billingType} onValueChange={(v) => setPricingForm((p) => ({ ...p, billingType: v }))} disabled={submitting}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Single</SelectItem>
                    <SelectItem value="PACKAGE">Package</SelectItem>
                    <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2"><Label htmlFor="priceDuration">Duration (minutes)</Label><Input id="priceDuration" type="number" min="0" value={pricingForm.duration} onChange={(e) => setPricingForm((p) => ({ ...p, duration: e.target.value }))} disabled={submitting} /></div>
            <div className="grid gap-2"><Label htmlFor="priceDesc">Description</Label><Textarea id="priceDesc" value={pricingForm.description} onChange={(e) => setPricingForm((p) => ({ ...p, description: e.target.value }))} disabled={submitting} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPricingDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handlePricingSubmit} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingPricing ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
