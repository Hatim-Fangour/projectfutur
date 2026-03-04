import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { updatePricing, deletePricing, updatePricingSchema } from '@/lib/services/service-catalog.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const PUT = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const body = await request.json()
      const input = updatePricingSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const plan = await updatePricing(id, input.data)
      return NextResponse.json({ success: true, data: plan })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('PUT /api/services/pricing/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update pricing plan' }, { status: 500 })
    }
  },
  { permission: 'write:services' }
)

export const DELETE = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      await deletePricing(id)
      return NextResponse.json({ success: true, message: 'Pricing plan deleted successfully' })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('DELETE /api/services/pricing/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete pricing plan' }, { status: 500 })
    }
  },
  { permission: 'delete:services' }
)
