'use client'

import {
  LuxuryTableWrapper,
  LuxuryTable,
  LuxuryTableHeader,
  LuxuryTableBody,
  LuxuryTableRow,
  LuxuryTableHead,
  LuxuryTableCell,
} from '@/components/ui/luxury-table'
import { GlassCard } from '@/components/ui/glass-card'
import { SkeletonLuxury } from '@/components/ui/skeleton-luxury'
import { LuxuryBadge, statusToVariant } from '@/components/ui/luxury-badge'
import { useEffect, useState } from 'react'
import { customerApi, staffApi, inventoryApi } from '@/lib/api-client'

interface Customer {
  id: string
  fullName: string
  email: string
  phone: string | null
  createdAt: string
}

interface StaffMember {
  id: string
  fullName: string
  email: string
  role: string
  status: string
  department: string | null
  specializations: string[]
}

interface InventoryItem {
  id: string
  name: string
  category: string | null
  currentQuantity: number
  minQuantity: number
  unit: string | null
  costPerUnit: string | null
  status: string
}

function TableSkeleton() {
  return (
    <GlassCard>
      <SkeletonLuxury className="h-5 w-40 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <SkeletonLuxury className="h-4 w-32" />
            <SkeletonLuxury className="h-4 w-24" />
            <SkeletonLuxury className="h-4 w-20" />
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await customerApi.list({ limit: 5 })
        if (res.success && res.data) setCustomers(res.data as Customer[])
      } catch { /* handled */ } finally { setLoading(false) }
    }
    fetchCustomers()
  }, [])

  if (loading) return <TableSkeleton />

  return (
    <div>
      <h3 className="text-base font-semibold mb-1">Recent Customers</h3>
      <p className="text-sm text-muted-foreground mb-4">Latest customers added to the system</p>
      {customers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No customers yet</p>
      ) : (
        <LuxuryTableWrapper>
          <LuxuryTable>
            <LuxuryTableHeader>
              <LuxuryTableRow>
                <LuxuryTableHead>Customer</LuxuryTableHead>
                <LuxuryTableHead>Email</LuxuryTableHead>
                <LuxuryTableHead>Phone</LuxuryTableHead>
                <LuxuryTableHead>Joined</LuxuryTableHead>
              </LuxuryTableRow>
            </LuxuryTableHeader>
            <LuxuryTableBody>
              {customers.map((customer) => (
                <LuxuryTableRow key={customer.id}>
                  <LuxuryTableCell className="font-medium">{customer.fullName}</LuxuryTableCell>
                  <LuxuryTableCell className="text-muted-foreground">{customer.email}</LuxuryTableCell>
                  <LuxuryTableCell>{customer.phone ?? '-'}</LuxuryTableCell>
                  <LuxuryTableCell className="text-muted-foreground">
                    {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </LuxuryTableCell>
                </LuxuryTableRow>
              ))}
            </LuxuryTableBody>
          </LuxuryTable>
        </LuxuryTableWrapper>
      )}
    </div>
  )
}

function StaffTable() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await staffApi.list({ limit: 5 })
        if (res.success && res.data) setStaff(res.data as StaffMember[])
      } catch { /* handled */ } finally { setLoading(false) }
    }
    fetchStaff()
  }, [])

  if (loading) return <TableSkeleton />

  return (
    <div>
      <h3 className="text-base font-semibold mb-1">Staff Members</h3>
      <p className="text-sm text-muted-foreground mb-4">Team overview</p>
      {staff.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No staff members yet</p>
      ) : (
        <LuxuryTableWrapper>
          <LuxuryTable>
            <LuxuryTableHeader>
              <LuxuryTableRow>
                <LuxuryTableHead>Staff Member</LuxuryTableHead>
                <LuxuryTableHead>Role</LuxuryTableHead>
                <LuxuryTableHead>Status</LuxuryTableHead>
                <LuxuryTableHead>Department</LuxuryTableHead>
              </LuxuryTableRow>
            </LuxuryTableHeader>
            <LuxuryTableBody>
              {staff.map((member) => (
                <LuxuryTableRow key={member.id}>
                  <LuxuryTableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-dark to-gold-light text-white flex items-center justify-center text-xs font-semibold">
                        {member.fullName.charAt(0)}
                      </div>
                      <span className="font-medium">{member.fullName}</span>
                    </div>
                  </LuxuryTableCell>
                  <LuxuryTableCell className="capitalize">{member.role.toLowerCase()}</LuxuryTableCell>
                  <LuxuryTableCell>
                    <LuxuryBadge variant={statusToVariant(member.status)}>
                      {member.status}
                    </LuxuryBadge>
                  </LuxuryTableCell>
                  <LuxuryTableCell className="text-muted-foreground">{member.department ?? '-'}</LuxuryTableCell>
                </LuxuryTableRow>
              ))}
            </LuxuryTableBody>
          </LuxuryTable>
        </LuxuryTableWrapper>
      )}
    </div>
  )
}

function InventoryTable() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await inventoryApi.list({ limit: 5 })
        if (res.success && res.data) setItems(res.data as InventoryItem[])
      } catch { /* handled */ } finally { setLoading(false) }
    }
    fetchInventory()
  }, [])

  if (loading) return <TableSkeleton />

  return (
    <div>
      <h3 className="text-base font-semibold mb-1">Inventory Status</h3>
      <p className="text-sm text-muted-foreground mb-4">Current stock levels</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No inventory items yet</p>
      ) : (
        <LuxuryTableWrapper>
          <LuxuryTable>
            <LuxuryTableHeader>
              <LuxuryTableRow>
                <LuxuryTableHead>Product</LuxuryTableHead>
                <LuxuryTableHead>Category</LuxuryTableHead>
                <LuxuryTableHead>Quantity</LuxuryTableHead>
                <LuxuryTableHead>Status</LuxuryTableHead>
              </LuxuryTableRow>
            </LuxuryTableHeader>
            <LuxuryTableBody>
              {items.map((item) => (
                <LuxuryTableRow key={item.id}>
                  <LuxuryTableCell className="font-medium">{item.name}</LuxuryTableCell>
                  <LuxuryTableCell className="text-muted-foreground">{item.category ?? '-'}</LuxuryTableCell>
                  <LuxuryTableCell>{item.currentQuantity} {item.unit ?? ''}</LuxuryTableCell>
                  <LuxuryTableCell>
                    <LuxuryBadge variant={statusToVariant(item.status)}>
                      {item.status.replace(/_/g, ' ')}
                    </LuxuryBadge>
                  </LuxuryTableCell>
                </LuxuryTableRow>
              ))}
            </LuxuryTableBody>
          </LuxuryTable>
        </LuxuryTableWrapper>
      )}
    </div>
  )
}

const TablesSection = () => {
  return (
    <div className="space-y-8 stagger-children">
      <CustomersTable />
      <StaffTable />
      <InventoryTable />
    </div>
  )
}

export default TablesSection
