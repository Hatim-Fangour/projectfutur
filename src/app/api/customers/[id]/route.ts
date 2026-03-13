import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  updateCustomerSchema,
} from '@/lib/services/customer.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const customer = await getCustomerById(id)
      if (!customer) {
        return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: customer })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('GET /api/customers/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch customer' }, { status: 500 })
    }
  },
  { permission: 'read:customers' }
)

export const PUT = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const body = await request.json()
      const input = updateCustomerSchema.safeParse(body)
      if (!input.success) {
        return NextResponse.json(
          { success: false, error: input.error.issues[0]?.message ?? 'Invalid input' },
          { status: 400 }
        )
      }
      const customer = await updateCustomer(id, input.data)
      return NextResponse.json({ success: true, data: customer })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('PUT /api/customers/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update customer' }, { status: 500 })
    }
  },
  { permission: 'write:customers' }
)

export const DELETE = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      await deleteCustomer(id)
      return NextResponse.json({ success: true, message: 'Customer archived successfully' })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('DELETE /api/customers/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete customer' }, { status: 500 })
    }
  },
  { permission: 'delete:customers' }
)
