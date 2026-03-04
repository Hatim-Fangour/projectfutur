import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { getInventoryItemById, updateInventoryItem, deleteInventoryItem, updateInventoryItemSchema } from '@/lib/services/inventory.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const item = await getInventoryItemById(id)
      if (!item) return NextResponse.json({ success: false, error: 'Inventory item not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: item })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/inventory/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch inventory item' }, { status: 500 })
    }
  },
  { permission: 'read:inventory' }
)

export const PUT = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const body = await request.json()
      const input = updateInventoryItemSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const item = await updateInventoryItem(id, input.data)
      return NextResponse.json({ success: true, data: item })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('PUT /api/inventory/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update inventory item' }, { status: 500 })
    }
  },
  { permission: 'write:inventory' }
)

export const DELETE = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      await deleteInventoryItem(id)
      return NextResponse.json({ success: true, message: 'Inventory item deleted successfully' })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('DELETE /api/inventory/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete inventory item' }, { status: 500 })
    }
  },
  // No delete:inventory permission exists, use write:inventory
  { permission: 'write:inventory' }
)
