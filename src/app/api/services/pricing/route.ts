import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { listPricing, createPricing, createPricingSchema } from '@/lib/services/service-catalog.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const serviceItemId = searchParams.get('serviceItemId') ?? undefined
      const data = await listPricing({ serviceItemId })
      return NextResponse.json({ success: true, data })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/services/pricing error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch pricing' }, { status: 500 })
    }
  },
  { permission: 'read:services' }
)

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const input = createPricingSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const plan = await createPricing(input.data)
      return NextResponse.json({ success: true, data: plan }, { status: 201 })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('POST /api/services/pricing error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create pricing plan' }, { status: 500 })
    }
  },
  { permission: 'write:services' }
)
