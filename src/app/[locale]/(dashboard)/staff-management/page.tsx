import type { Metadata } from 'next'
import StaffPageClient from './StaffPageClient'

export const metadata: Metadata = {
  title: 'Staff Management',
  description: 'Manage spa staff members, their roles, specializations, schedules, and performance.',
}

export default function StaffManagementPage() {
  return <StaffPageClient />
}
