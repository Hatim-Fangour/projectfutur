import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import {
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  updateAppointmentSchema,
  ServiceError,
} from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const appointment = await getAppointmentById(id)
      if (!appointment) {
        return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: appointment })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('GET /api/appointments/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch appointment' }, { status: 500 })
    }
  },
  { permission: 'read:appointments' }
)

export const PUT = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const body = await request.json()
      const input = updateAppointmentSchema.safeParse(body)
      if (!input.success) {
        return NextResponse.json(
          { success: false, error: input.error.issues[0]?.message ?? 'Invalid input' },
          { status: 400 }
        )
      }
      const appointment = await updateAppointment(id, input.data)
      return NextResponse.json({ success: true, data: appointment })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('PUT /api/appointments/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update appointment' }, { status: 500 })
    }
  },
  { permission: 'write:appointments' }
)

export const DELETE = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      await deleteAppointment(id)
      return NextResponse.json({ success: true, message: 'Appointment deleted successfully' })
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      }
      console.error('DELETE /api/appointments/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete appointment' }, { status: 500 })
    }
  },
  { permission: 'delete:appointments' }
)
