import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import {
  getStaffSchedule,
  updateStaffSchedule,
  updateScheduleSchema,
} from '@/lib/services/staff.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const schedules = await getStaffSchedule(id)
      return NextResponse.json({ success: true, data: schedules })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('GET /api/staff/[id]/schedule error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch schedule' }, { status: 500 })
    }
  },
  { permission: 'read:staff' }
)

export const PUT = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const body = await request.json()
      const input = updateScheduleSchema.safeParse(body)
      if (!input.success) {
        return NextResponse.json(
          { success: false, error: input.error.issues[0]?.message ?? 'Invalid input' },
          { status: 400 }
        )
      }
      const schedules = await updateStaffSchedule(id, input.data)
      return NextResponse.json({ success: true, data: schedules })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('PUT /api/staff/[id]/schedule error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update schedule' }, { status: 500 })
    }
  },
  { permission: 'write:staff' }
)
