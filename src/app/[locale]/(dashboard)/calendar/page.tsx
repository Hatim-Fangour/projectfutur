import type { Metadata } from 'next'
import CalendarPageClient from './CalendarPageClient'

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'View and manage spa appointments on an interactive calendar with drag-and-drop scheduling.',
}

export default function CalendarPage() {
  return <CalendarPageClient />
}
