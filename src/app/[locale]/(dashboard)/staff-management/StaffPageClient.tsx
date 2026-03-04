'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { staffApi } from '@/lib/api-client'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { SkeletonPageHeader, SkeletonStatCards, SkeletonTable } from '@/components/ui/skeleton-luxury'
import { LuxuryBadge, statusToVariant } from '@/components/ui/luxury-badge'
import {
  Grid, List, Loader2, Plus, Pencil, Trash2, Users, UserCheck, UserX, Star,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

// Types matching the API response
interface StaffMember {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: string
  department: string | null
  status: string
  employmentType: string
  startDate: string | null
  specializations: string[]
  certifications: string[]
  pictureURL: string | null
  createdAt: string
}

type FormData = {
  fullName: string
  email: string
  phone: string
  role: string
  department: string
  status: string
  employmentType: string
  specializations: string
}

const ROLES = ['OWNER', 'MANAGER', 'STAFF', 'RECEPTIONIST', 'THERAPIST'] as const
const STATUSES = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'] as const
const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE'] as const

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

function formatRole(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE': return 'default'
    case 'ON_LEAVE': return 'secondary'
    case 'TERMINATED': return 'destructive'
    default: return 'outline'
  }
}

const emptyForm: FormData = {
  fullName: '', email: '', phone: '', role: 'THERAPIST',
  department: '', status: 'ACTIVE', employmentType: 'FULL_TIME', specializations: '',
}

export default function StaffManagementPage() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true)
      const res = await staffApi.list({ limit: 100 })
      if (res.success && res.data) {
        setStaffMembers(res.data as StaffMember[])
      } else {
        toast.error(res.error ?? 'Failed to load staff')
      }
    } catch {
      toast.error('Failed to load staff members')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  // Filtering
  const filteredStaff = useMemo(() => {
    return staffMembers.filter((s) => {
      const matchSearch = !searchTerm ||
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchRole = !roleFilter || s.role === roleFilter
      const matchStatus = !statusFilter || s.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [staffMembers, searchTerm, roleFilter, statusFilter])

  // Stats
  const stats = useMemo(() => ({
    total: staffMembers.length,
    active: staffMembers.filter((s) => s.status === 'ACTIVE').length,
    onLeave: staffMembers.filter((s) => s.status === 'ON_LEAVE').length,
  }), [staffMembers])

  // Handlers
  const openCreate = () => {
    setEditingStaff(null)
    setFormData(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (staff: StaffMember) => {
    setEditingStaff(staff)
    setFormData({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone ?? '',
      role: staff.role,
      department: staff.department ?? '',
      status: staff.status,
      employmentType: staff.employmentType,
      specializations: staff.specializations.join(', '),
    })
    setDialogOpen(true)
  }

  const openDelete = (staff: StaffMember) => {
    setDeletingStaff(staff)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        role: formData.role,
        department: formData.department.trim() || null,
        status: formData.status,
        employmentType: formData.employmentType,
        specializations: formData.specializations.split(',').map((s) => s.trim()).filter(Boolean),
      }

      if (editingStaff) {
        const res = await staffApi.update(editingStaff.id, payload)
        if (res.success) {
          toast.success('Staff member updated')
          setDialogOpen(false)
          fetchStaff()
        } else {
          toast.error(res.error ?? 'Failed to update staff member')
        }
      } else {
        const res = await staffApi.create(payload)
        if (res.success) {
          toast.success('Staff member added')
          setDialogOpen(false)
          fetchStaff()
        } else {
          toast.error(res.error ?? 'Failed to add staff member')
        }
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingStaff) return
    setSubmitting(true)
    try {
      const res = await staffApi.delete(deletingStaff.id)
      if (res.success) {
        toast.success('Staff member removed')
        setDeleteDialogOpen(false)
        setDeletingStaff(null)
        fetchStaff()
      } else {
        toast.error(res.error ?? 'Failed to delete staff member')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
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

  return (
    <div className="space-y-6 pb-6 animate-fade-in-up">
      <PageHeader
        title="Staff Management"
        subtitle="Manage staff members, roles, and schedules"
        actions={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Staff Member</Button>}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <StatCard label="Total Staff" value={stats.total} icon={Users} />
        <StatCard label="Active Staff" value={stats.active} trendPositive={true} icon={UserCheck} />
        <StatCard label="On Leave" value={stats.onLeave} trendPositive={stats.onLeave === 0} icon={UserX} />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gold/10 pb-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2"
        />
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((r) => <SelectItem key={r} value={r}>{formatRole(r)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Showing {filteredStaff.length} of {staffMembers.length} staff members
        </span>
        <div className="flex items-center gap-1">
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}><List className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'cards' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('cards')}><Grid className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Content */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No staff members found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || roleFilter || statusFilter
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by adding your first staff member.'}
          </p>
          {!searchTerm && !roleFilter && !statusFilter && (
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Staff Member</Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-lg border overflow-hidden animate-fade-in-up">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.pictureURL ?? undefined} />
                        <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{formatRole(member.role)}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{member.department ?? '-'}</TableCell>
                  <TableCell><LuxuryBadge variant={statusToVariant(member.status)}>{member.status.replace('_', ' ')}</LuxuryBadge></TableCell>
                  <TableCell className="text-muted-foreground capitalize">{member.employmentType.replace('_', ' ').toLowerCase()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(member)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openDelete(member)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filteredStaff.map((member) => (
            <Card key={member.id} className="card-hover-lift animate-fade-in-up">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.pictureURL ?? undefined} />
                      <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{member.fullName}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <LuxuryBadge variant={statusToVariant(member.status)}>{member.status.replace('_', ' ')}</LuxuryBadge>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium">{formatRole(member.role)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Department</span>
                    <span>{member.department ?? '-'}</span>
                  </div>
                  {member.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.specializations.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                      {member.specializations.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{member.specializations.length - 3}</Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-1 mt-4">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(member)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openDelete(member)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
            <DialogDescription>{editingStaff ? 'Update staff member details.' : 'Add a new staff member to your team.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))} disabled={submitting} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} disabled={submitting} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} disabled={submitting} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData((p) => ({ ...p, role: v }))} disabled={submitting}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r} value={r}>{formatRole(r)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))} disabled={submitting}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={formData.department} onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))} disabled={submitting} />
              </div>
              <div className="grid gap-2">
                <Label>Employment Type</Label>
                <Select value={formData.employmentType} onValueChange={(v) => setFormData((p) => ({ ...p, employmentType: v }))} disabled={submitting}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="specializations">Specializations (comma-separated)</Label>
              <Input id="specializations" value={formData.specializations} onChange={(e) => setFormData((p) => ({ ...p, specializations: e.target.value }))} disabled={submitting} placeholder="e.g. Swedish Massage, Deep Tissue" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingStaff ? 'Save Changes' : 'Add Staff Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deletingStaff?.fullName}</strong>? This action cannot be undone.
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
