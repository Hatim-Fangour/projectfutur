import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { getItemById, updateItem, deleteItem, updateItemSchema } from '@/lib/services/service-catalog.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const item = await getItemById(id)
      if (!item) return NextResponse.json({ success: false, error: 'Service item not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: item })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/services/items/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch item' }, { status: 500 })
    }
  },
  { permission: 'read:services' }
)

export const PUT = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const body = await request.json()
      const input = updateItemSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const item = await updateItem(id, input.data)
      return NextResponse.json({ success: true, data: item })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('PUT /api/services/items/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 })
    }
  },
  { permission: 'write:services' }
)

export const DELETE = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      await deleteItem(id)
      return NextResponse.json({ success: true, message: 'Item deleted successfully' })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('DELETE /api/services/items/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 })
    }
  },
  { permission: 'delete:services' }
)
