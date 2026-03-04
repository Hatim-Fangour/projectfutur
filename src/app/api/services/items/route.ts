import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { listItems, createItem, listServicesSchema, createItemSchema } from '@/lib/services/service-catalog.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const input = listServicesSchema.safeParse(Object.fromEntries(searchParams.entries()))
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid query' }, { status: 400 })
      const result = await listItems(input.data)
      return NextResponse.json({ success: true, ...result })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/services/items error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 })
    }
  },
  { permission: 'read:services' }
)

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const input = createItemSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const item = await createItem(input.data)
      return NextResponse.json({ success: true, data: item }, { status: 201 })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('POST /api/services/items error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 })
    }
  },
  { permission: 'write:services' }
)
