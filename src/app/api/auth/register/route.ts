import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

/**
 * POST /api/auth/register
 * Creates a StaffMember record for a newly registered Supabase user.
 * Called after Supabase auth.signUp() succeeds on the client.
 * The first user is created as OWNER.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const parseResult = registerSchema.safeParse(body)
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstIssue?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { fullName, email } = parseResult.data

    // Get the authenticated user from the session
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
            // Not needed for POST
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if a StaffMember already exists for this auth user
    const existing = await prisma.staffMember.findFirst({
      where: { authUserId: user.id },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Account profile already exists' },
        { status: 409 }
      )
    }

    // Check if this is the first staff member (make them OWNER)
    const staffCount = await prisma.staffMember.count({
      where: { isDeleted: false },
    })
    const role = staffCount === 0 ? 'OWNER' : 'STAFF'

    // Create the StaffMember record
    const staffMember = await prisma.staffMember.create({
      data: {
        authUserId: user.id,
        fullName,
        email,
        role,
        status: 'ACTIVE',
        employmentType: 'FULL_TIME',
        specializations: [],
        certifications: [],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(
      { success: true, data: staffMember },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/auth/register error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account profile' },
      { status: 500 }
    )
  }
}
