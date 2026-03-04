import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import {
  listCustomers,
  createCustomer,
  listCustomersSchema,
  createCustomerSchema,
} from '@/lib/services/customer.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const input = listCustomersSchema.safeParse(Object.fromEntries(searchParams.entries()))
      if (!input.success) {
        return NextResponse.json(
          { success: false, error: input.error.issues[0]?.message ?? 'Invalid query parameters' },
          { status: 400 }
        )
      }
      const result = await listCustomers(input.data)
      return NextResponse.json({ success: true, ...result })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('GET /api/customers error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch customers' }, { status: 500 })
    }
  },
  { permission: 'read:customers' }
)

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const input = createCustomerSchema.safeParse(body)
      if (!input.success) {
        return NextResponse.json(
          { success: false, error: input.error.issues[0]?.message ?? 'Invalid input' },
          { status: 400 }
        )
      }
      const customer = await createCustomer(input.data)
      return NextResponse.json({ success: true, data: customer }, { status: 201 })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('POST /api/customers error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create customer' }, { status: 500 })
    }
  },
  { permission: 'write:customers' }
)
