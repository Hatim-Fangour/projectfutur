import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@supabase/ssr'

/**
 * GET /api/auth/profile
 * Returns the staff profile for the authenticated user.
 * Used by AuthProvider to load user role and profile data.
 */
export async function GET(request: NextRequest) {
  try {
    // Validate auth from cookies
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
            // Not needed for GET requests
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Find the staff member by auth user ID
    const staffMember = await prisma.staffMember.findFirst({
      where: {
        authUserId: user.id,
        isDeleted: false,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        pictureURL: true,
        role: true,
        department: true,
        status: true,
      },
    })

    if (!staffMember) {
      return NextResponse.json(
        { success: false, error: 'Staff profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: staffMember,
    })
  } catch (error) {
    console.error('GET /api/auth/profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
