'use client'

import {
  Home,
  Calendar,
  Settings,
  User2,
  ChevronUp,
  NotebookPen,
  Landmark,
  HandHelping,
  UserCog,
  Shapes,
  Users,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar'
import Link from 'next/link'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useAuth } from '@/providers/AuthProvider'
import { hasPermission, type Permission, type UserRole } from '@/lib/auth/permissions'
import { useState } from 'react'

interface NavItem {
  label: string
  url: string
  icon: LucideIcon
  /** Permission required to see this menu item. If omitted, always visible. */
  permission?: Permission
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', url: '/', icon: Home },
  { label: 'Customers', url: '/customers', icon: UserCog, permission: 'read:customers' },
  { label: 'Calendar', url: '/calendar', icon: Calendar, permission: 'read:appointments' },
  { label: 'Services', url: '/services', icon: Shapes, permission: 'read:services' },
  {
    label: 'Finance Management',
    url: '/financemanagement',
    icon: Landmark,
    permission: 'read:finance',
  },
  {
    label: 'Office Inventory',
    url: '/needs',
    icon: HandHelping,
    permission: 'read:inventory',
  },
  { label: 'Notes', url: '/notes', icon: NotebookPen, permission: 'read:notes' },
  {
    label: 'Staff Management',
    url: '/staff-management',
    icon: Users,
    permission: 'read:staff',
  },
]

/**
 * Filters navigation items based on the user's role permissions.
 */
function getVisibleItems(role: UserRole | null): NavItem[] {
  if (!role) return [NAV_ITEMS[0]] // Only Home visible while loading
  return NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(role, item.permission)
  )
}

/**
 * Extracts initials from a full name (max 2 characters).
 */
function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function AppSidebar() {
  const { profile, userRole, loading, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const visibleItems = getVisibleItems(userRole)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Image src="/logo.png" alt="" width={20} height={20} />
                <span>Magic Spa Center</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings link - only for users with manage:settings */}
        {userRole && hasPermission(userRole, 'manage:settings') && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/settings">
                      <Settings aria-hidden="true" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {loading ? (
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  ) : (
                    <User2 aria-hidden="true" />
                  )}
                  <span className="truncate">
                    {loading
                      ? 'Loading...'
                      : profile?.fullName ?? 'Unknown user'}
                  </span>
                  <ChevronUp aria-hidden="true" className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/settings">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
