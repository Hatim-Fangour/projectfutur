import type { Metadata } from 'next'
import AppSidebar from '@/components/AppSidebar'
import Navbar from '@/components/Navbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Magic Spa Center',
  },
  description: 'Manage your spa business from the Magic Spa Center dashboard.',
}

/**
 * Dashboard layout: includes sidebar and navbar.
 * All authenticated pages are wrapped in this layout.
 * The middleware ensures only authenticated users reach these pages.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex w-full">
        <AppSidebar />
        <main className="w-full h-screen flex flex-col">
          <Navbar />
          <div className="px-4 md:px-8 lg:px-16 pb-6 flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
