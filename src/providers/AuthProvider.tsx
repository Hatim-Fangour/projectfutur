'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/auth/permissions'

interface StaffProfile {
  id: string
  fullName: string
  email: string
  pictureURL: string | null
  role: UserRole
  department: string | null
}

interface AuthContextValue {
  /** Supabase auth user object */
  user: User | null
  /** Staff profile from the database */
  profile: StaffProfile | null
  /** User's application role */
  userRole: UserRole | null
  /** Whether the auth state is still loading */
  loading: boolean
  /** Sign out the current user */
  signOut: () => Promise<void>
  /** Refresh the user profile from the database */
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

/**
 * Fetches the staff profile for the authenticated user.
 */
async function fetchStaffProfile(userId: string): Promise<StaffProfile | null> {
  try {
    const response = await fetch(`/api/auth/profile?userId=${userId}`)
    if (!response.ok) return null
    const data = await response.json()
    if (data.success && data.data) {
      return data.data as StaffProfile
    }
    return null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  const loadProfile = useCallback(
    async (authUser: User) => {
      const staffProfile = await fetchStaffProfile(authUser.id)
      setProfile(staffProfile)
    },
    []
  )

  const refreshUser = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (currentUser) {
      setUser(currentUser)
      await loadProfile(currentUser)
    }
  }, [supabase, loadProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    // Redirect handled by middleware
    window.location.href = '/login'
  }, [supabase])

  useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (currentUser) {
          setUser(currentUser)
          await loadProfile(currentUser)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await loadProfile(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, loadProfile])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      userRole: profile?.role ?? null,
      loading,
      signOut,
      refreshUser,
    }),
    [user, profile, loading, signOut, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access authentication state.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
