import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import {
  getStaffById,
  updateStaff,
  deleteStaff,
  updateStaffSchema,
} from '@/lib/services/staff.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const staff = await getStaffById(id)
      if (!staff) {
        return NextResponse.json({ success: false, error: 'Staff member not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: staff })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('GET /api/staff/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch staff member' }, { status: 500 })
    }
  },
  { permission: 'read:staff' }
)

export const PUT = withAuth(
  async (request: NextRequest, { auth, params }) => {
    try {
      const { id } = await params!
      const body = await request.json()
      const input = updateStaffSchema.safeParse(body)
      if (!input.success) {
        return NextResponse.json(
          { success: false, error: input.error.issues[0]?.message ?? 'Invalid input' },
          { status: 400 }
        )
      }
      const staff = await updateStaff(id, input.data, auth.role)
      return NextResponse.json({ success: true, data: staff })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('PUT /api/staff/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update staff member' }, { status: 500 })
    }
  },
  { permission: 'write:staff' }
)

export const DELETE = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      await deleteStaff(id)
      return NextResponse.json({ success: true, message: 'Staff member archived successfully' })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('DELETE /api/staff/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete staff member' }, { status: 500 })
    }
  },
  { permission: 'delete:staff' }
)
