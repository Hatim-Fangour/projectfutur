import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import {
  listAppointments,
  createAppointment,
  listAppointmentsSchema,
  createAppointmentSchema,
  ServiceError,
} from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const input = listAppointmentsSchema.safeParse(
        Object.fromEntries(searchParams.entries())
      )
      if (!input.success) {
        return NextResponse.json(
          { success: false, error: input.error.issues[0]?.message ?? 'Invalid query parameters' },
          { status: 400 }
        )
      }

      const result = await listAppointments(input.data)
      return NextResponse.json({ success: true, ...result })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('GET /api/appointments error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch appointments' }, { status: 500 })
    }
  },
  { permission: 'read:appointments' }
)

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const input = createAppointmentSchema.safeParse(body)
      if (!input.success) {
        return NextResponse.json(
          { success: false, error: input.error.issues[0]?.message ?? 'Invalid input' },
          { status: 400 }
        )
      }

      const appointment = await createAppointment(input.data)
      return NextResponse.json({ success: true, data: appointment }, { status: 201 })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('POST /api/appointments error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create appointment' }, { status: 500 })
    }
  },
  { permission: 'write:appointments' }
)
