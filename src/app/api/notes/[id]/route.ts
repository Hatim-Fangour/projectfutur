import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { getNoteById, updateNote, deleteNote, updateNoteSchema } from '@/lib/services/note.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const note = await getNoteById(id)
      if (!note) return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: note })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/notes/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch note' }, { status: 500 })
    }
  },
  { permission: 'read:notes' }
)

export const PUT = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      const body = await request.json()
      const input = updateNoteSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const note = await updateNote(id, input.data)
      return NextResponse.json({ success: true, data: note })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('PUT /api/notes/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update note' }, { status: 500 })
    }
  },
  { permission: 'write:notes' }
)

export const DELETE = withAuth(
  async (_request: NextRequest, { params }) => {
    try {
      const { id } = await params!
      await deleteNote(id)
      return NextResponse.json({ success: true, message: 'Note deleted successfully' })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('DELETE /api/notes/[id] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete note' }, { status: 500 })
    }
  },
  // Notes don't have a delete:notes permission -- use write:notes for delete
  { permission: 'write:notes' }
)
