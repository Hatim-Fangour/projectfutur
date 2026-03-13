import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { listCategories, createCategory, createCategorySchema } from '@/lib/services/service-catalog.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async () => {
    try {
      const categories = await listCategories()
      return NextResponse.json({ success: true, data: categories })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('GET /api/services/categories error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 })
    }
  },
  { permission: 'read:services' }
)

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const input = createCategorySchema.safeParse(body)
      if (!input.success) {
        return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      }
      const category = await createCategory(input.data)
      return NextResponse.json({ success: true, data: category }, { status: 201 })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('POST /api/services/categories error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 })
    }
  },
  { permission: 'write:services' }
)
