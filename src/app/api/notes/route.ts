import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { listNotes, createNote, listNotesSchema, createNoteSchema } from '@/lib/services/note.service'
import { ServiceError } from '@/lib/services/appointment.service'

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const input = listNotesSchema.safeParse(Object.fromEntries(searchParams.entries()))
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid query' }, { status: 400 })
      const result = await listNotes(input.data)
      return NextResponse.json({ success: true, ...result })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('GET /api/notes error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 })
    }
  },
  { permission: 'read:notes' }
)

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const input = createNoteSchema.safeParse(body)
      if (!input.success) return NextResponse.json({ success: false, error: input.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
      const note = await createNote(input.data)
      return NextResponse.json({ success: true, data: note }, { status: 201 })
    } catch (error) {
      if (error instanceof ServiceError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
      console.error('POST /api/notes error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create note' }, { status: 500 })
    }
  },
  { permission: 'write:notes' }
)
