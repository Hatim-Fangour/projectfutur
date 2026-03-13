import type { Metadata } from 'next'
import NotesPageClient from './NotesPageClient'

export const metadata: Metadata = {
  title: 'Notes',
  description: 'Create and manage customer notes, observations, and treatment records.',
}

export default function NotesPage() {
  return <NotesPageClient />
}
