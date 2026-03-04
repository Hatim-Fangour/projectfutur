'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { noteApi, customerApi } from '@/lib/api-client'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { SkeletonPageHeader, SkeletonStatCards, SkeletonCards } from '@/components/ui/skeleton-luxury'
import {
  Loader2, Notebook, Plus, Pencil, Trash2, Search, Lock,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface Note {
  id: string
  customerId: string
  title: string | null
  content: string
  writer: string | null
  tags: string[]
  isPrivate: boolean
  createdAt: string
  updatedAt: string
  customer: { id: string; fullName: string }
}

interface CustomerOption {
  id: string
  fullName: string
}

interface NoteFormData {
  customerId: string
  title: string
  content: string
  writer: string
  tags: string
  isPrivate: boolean
}

const emptyForm: NoteFormData = {
  customerId: '', title: '', content: '', writer: '', tags: '', isPrivate: false,
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deletingNote, setDeletingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState<NoteFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const fetchNotes = useCallback(async (p = 1, search = '') => {
    try {
      setLoading(true)
      const res = await noteApi.list({ page: p, limit: 20, search: search || undefined })
      if (res.success && res.data) {
        setNotes(res.data as Note[])
        if (res.pagination) {
          setTotalPages(res.pagination.pages)
          setPage(res.pagination.page)
        }
      } else {
        toast.error(res.error ?? 'Failed to load notes')
      }
    } catch {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await customerApi.list({ limit: 100 })
      if (res.success && res.data) {
        setCustomers((res.data as CustomerOption[]).map((c) => ({ id: c.id, fullName: c.fullName })))
      }
    } catch { /* handled */ }
  }, [])

  useEffect(() => {
    fetchNotes()
    fetchCustomers()
  }, [fetchNotes, fetchCustomers])

  const handleSearch = () => {
    fetchNotes(1, searchTerm)
  }

  const openCreate = () => {
    setEditingNote(null)
    setFormData(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      customerId: note.customerId,
      title: note.title ?? '',
      content: note.content,
      writer: note.writer ?? '',
      tags: note.tags.join(', '),
      isPrivate: note.isPrivate,
    })
    setDialogOpen(true)
  }

  const openDelete = (note: Note) => {
    setDeletingNote(note)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.content.trim()) { toast.error('Content is required'); return }
    if (!editingNote && !formData.customerId) { toast.error('Select a customer'); return }
    setSubmitting(true)
    try {
      const payload = {
        title: formData.title.trim() || null,
        content: formData.content.trim(),
        writer: formData.writer.trim() || null,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        isPrivate: formData.isPrivate,
        ...(editingNote ? {} : { customerId: formData.customerId }),
      }
      if (editingNote) {
        const res = await noteApi.update(editingNote.id, payload)
        if (res.success) { toast.success('Note updated'); setDialogOpen(false); fetchNotes(page, searchTerm) }
        else toast.error(res.error ?? 'Failed to update note')
      } else {
        const res = await noteApi.create(payload)
        if (res.success) { toast.success('Note created'); setDialogOpen(false); fetchNotes(1, searchTerm) }
        else toast.error(res.error ?? 'Failed to create note')
      }
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deletingNote) return
    setSubmitting(true)
    try {
      const res = await noteApi.delete(deletingNote.id)
      if (res.success) { toast.success('Note deleted'); setDeleteDialogOpen(false); fetchNotes(page, searchTerm) }
      else toast.error(res.error ?? 'Failed to delete note')
    } catch { toast.error('An error occurred') } finally { setSubmitting(false) }
  }

  if (loading && notes.length === 0) {
    return (
      <div className="space-y-6 pb-6">
        <SkeletonPageHeader />
        <SkeletonStatCards count={2} />
        <SkeletonCards count={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6 animate-fade-in-up">
      <PageHeader
        title="Notes"
        subtitle="Manage customer notes and observations"
        actions={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> New Note</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 stagger-children">
        <StatCard label="Total Notes" value={notes.length} icon={Notebook} />
        <StatCard label="Private Notes" value={notes.filter((n) => n.isPrivate).length} icon={Lock} />
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-md"
        />
        <Button variant="outline" onClick={handleSearch}><Search className="h-4 w-4" /></Button>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <Notebook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notes found</h3>
          <p className="text-muted-foreground mb-4">Create your first note to get started.</p>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> New Note</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {notes.map((note) => (
            <Card key={note.id} className="card-hover-lift animate-fade-in-up">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{note.title || 'Untitled Note'}</p>
                    <p className="text-xs text-muted-foreground">{note.customer.fullName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {note.isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                  </div>
                )}
                {note.writer && (
                  <p className="text-xs text-muted-foreground">By: {note.writer}</p>
                )}
                <div className="flex justify-end gap-1 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(note)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openDelete(note)}><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchNotes(page - 1, searchTerm)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchNotes(page + 1, searchTerm)}>Next</Button>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Edit Note' : 'New Note'}</DialogTitle>
            <DialogDescription>{editingNote ? 'Update this note.' : 'Create a new customer note.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!editingNote && (
              <div className="grid gap-2">
                <Label>Customer *</Label>
                <Select value={formData.customerId} onValueChange={(v) => setFormData((p) => ({ ...p, customerId: v }))} disabled={submitting}>
                  <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} disabled={submitting} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea id="content" value={formData.content} onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))} disabled={submitting} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="writer">Writer</Label>
                <Input id="writer" value={formData.writer} onChange={(e) => setFormData((p) => ({ ...p, writer: e.target.value }))} disabled={submitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" value={formData.tags} onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))} disabled={submitting} placeholder="e.g. follow-up, skin" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isPrivate" checked={formData.isPrivate} onCheckedChange={(v) => setFormData((p) => ({ ...p, isPrivate: v }))} disabled={submitting} />
              <Label htmlFor="isPrivate">Private note</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingNote ? 'Save Changes' : 'Create Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>Are you sure you want to delete this note? This action cannot be undone.</DialogDescription>
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
