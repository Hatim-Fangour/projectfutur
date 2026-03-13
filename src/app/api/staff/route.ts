import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import {
  listStaff,
  createStaff,
  listStaffSchema,
  createStaffSchema,
} from '@/lib/services/staff.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const input = listStaffSchema.safeParse(Object.fromEntries(searchParams.entries()))
      if (!input.success) {
        return NextResponse.json(
          { success: false, error: input.error.issues[0]?.message ?? 'Invalid query parameters' },
          { status: 400 }
        )
      }
      const result = await listStaff(input.data)
      return NextResponse.json({ success: true, ...result })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('GET /api/staff error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch staff' }, { status: 500 })
    }
  },
  { permission: 'read:staff' }
)

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const input = createStaffSchema.safeParse(body)
      if (!input.success) {
        return NextResponse.json(
          { success: false, error: input.error.issues[0]?.message ?? 'Invalid input' },
          { status: 400 }
        )
      }
      const staff = await createStaff(input.data)
      return NextResponse.json({ success: true, data: staff }, { status: 201 })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('POST /api/staff error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create staff member' }, { status: 500 })
    }
  },
  { permission: 'write:staff' }
)
