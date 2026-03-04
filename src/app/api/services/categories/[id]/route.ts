import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { getCategoryById, updateCategory, deleteCategory, updateCategorySchema } from '@/lib/services/service-catalog.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const category = await getCategoryById(id)
      if (!category) return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: category })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/services/categories/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch category' }, { status: 500 })
    }
  },
  { permission: 'read:services' }
)

export const PUT = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const body = await request.json()
      const input = updateCategorySchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const category = await updateCategory(id, input.data)
      return NextResponse.json({ success: true, data: category })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('PUT /api/services/categories/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 })
    }
  },
  { permission: 'write:services' }
)

export const DELETE = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      await deleteCategory(id)
      return NextResponse.json({ success: true, message: 'Category deleted successfully' })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('DELETE /api/services/categories/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 })
    }
  },
  { permission: 'delete:services' }
)
