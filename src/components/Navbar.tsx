'use client'

import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { LogOut, Moon, Settings, Sun, User, Loader2 } from 'lucide-react'
import { SidebarTrigger } from './ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useAuth } from '@/providers/AuthProvider'
import { useState } from 'react'
import NotificationBell from './NotificationBell'
import LanguageSwitcher from './LanguageSwitcher'

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

/**
 * Formats a role enum into a human-readable label.
 */
function formatRole(role: string | null | undefined): string {
  if (!role) return ''
  return role.charAt(0) + role.slice(1).toLowerCase()
}

export default function Navbar() {
  const { setTheme } = useTheme()
  const { profile, loading, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const t = useTranslations('nav')

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <div className="p-4 flex items-center justify-between sticky top-0 bg-background z-10 border-b">
      {/* LEFT */}
      <SidebarTrigger />

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* LANGUAGE SWITCHER */}
        <LanguageSwitcher />

        {/* THEME MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">{t('toggleTheme')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              {t('light')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              {t('dark')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              {t('system')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* NOTIFICATIONS */}
        <NotificationBell />

        {/* USER MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={profile?.pictureURL ?? undefined}
                  alt={profile?.fullName ?? 'User avatar'}
                />
                <AvatarFallback>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    getInitials(profile?.fullName)
                  )}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10} align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.fullName ?? t('unknownUser')}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email ?? ''}
                </p>
                {profile?.role && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {formatRole(profile.role)}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              {t('profile')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              {t('settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {signingOut ? t('signingOut') : t('signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
