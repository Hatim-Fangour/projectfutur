import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import {
  type Permission,
  type UserRole,
  hasPermission,
  isValidRole,
} from '@/lib/auth/permissions'

/**
 * Authenticated user context passed to route handlers.
 */
export interface AuthContext {
  /** Supabase auth user ID (UUID) */
  userId: string
  /** User email from Supabase auth */
  email: string
  /** Application role from StaffMember record */
  role: UserRole
  /** StaffMember record ID (cuid) */
  staffId: string
}

/**
 * Route handler function signature after auth validation.
 */
type AuthenticatedHandler = (
  request: NextRequest,
  context: {
    auth: AuthContext
    params?: Promise<Record<string, string>>
  }
) => Promise<NextResponse> | NextResponse

interface WithAuthOptions {
  /** Permission required to access this route. If omitted, only authentication is checked. */
  permission?: Permission
}

/**
 * Higher-order function that wraps Next.js API route handlers with
 * authentication and authorization checks.
 *
 * Usage:
 * ```ts
 * export const GET = withAuth(async (req, { auth }) => {
 *   // auth.userId, auth.email, auth.role, auth.staffId available
 *   return NextResponse.json({ success: true })
 * }, { permission: 'read:customers' })
 * ```
 */
export function withAuth(
  handler: AuthenticatedHandler,
  options?: WithAuthOptions
) {
  return async (
    request: NextRequest,
    routeContext?: { params?: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      // Create a Supabase client from request cookies
      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321'
      const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll() {
              // In route handlers we cannot set cookies on the request,
              // but the middleware handles session refresh.
            },
          },
        }
      )

      // Validate the session
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Look up the staff member by their Supabase auth user ID
      const staffMember = await prisma.staffMember.findFirst({
        where: {
          authUserId: user.id,
          isDeleted: false,
          status: 'ACTIVE',
        },
        select: {
          id: true,
          role: true,
          email: true,
        },
      })

      if (!staffMember) {
        return NextResponse.json(
          { success: false, error: 'User account not found or inactive' },
          { status: 403 }
        )
      }

      const role = staffMember.role as UserRole
      if (!isValidRole(role)) {
        return NextResponse.json(
          { success: false, error: 'Invalid user role' },
          { status: 403 }
        )
      }

      // Check permission if required
      if (options?.permission && !hasPermission(role, options.permission)) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      const auth: AuthContext = {
        userId: user.id,
        email: user.email ?? staffMember.email,
        role,
        staffId: staffMember.id,
      }

      return handler(request, { auth, params: routeContext?.params })
    } catch (error) {
      console.error('withAuth error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
