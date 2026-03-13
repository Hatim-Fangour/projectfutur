import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    ),
  ownerSetupKey: z.string().optional(),
})

/**
 * POST /api/auth/register
 * Creates a Supabase auth user + StaffMember record in one server-side call.
 * Uses the admin API so we bypass email confirmation (staff-only registration).
 * The first user is created as OWNER.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parseResult = registerSchema.safeParse(body)
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstIssue?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { fullName, email, password } = parseResult.data

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if email already exists in Supabase
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Create auth user with admin API (auto-confirms email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (authError || !authData.user) {
      console.error('Supabase admin createUser error:', authError)
      return NextResponse.json(
        { success: false, error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Determine role
    const staffCount = await prisma.staffMember.count({
      where: { isDeleted: false },
    })
    let role: 'OWNER' | 'STAFF' = 'STAFF'
    if (staffCount === 0) {
      const setupKey = process.env.OWNER_SETUP_KEY
      if (setupKey) {
        const providedKey = body.ownerSetupKey
        if (providedKey !== setupKey) {
          // Clean up the auth user we just created
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          return NextResponse.json(
            { success: false, error: 'Invalid or missing owner setup key' },
            { status: 403 }
          )
        }
      }
      role = 'OWNER'
    }

    // Create StaffMember record
    const staffMember = await prisma.staffMember.create({
      data: {
        authUserId: authData.user.id,
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
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
