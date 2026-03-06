import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  authUserId: z.string().uuid('Invalid user ID'),
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

    const { fullName, email, authUserId } = parseResult.data

    // Verify the user exists in Supabase using the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(authUserId)

    if (getUserError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid user' },
        { status: 401 }
      )
    }

    // Check if a StaffMember already exists for this auth user or email
    const existing = await prisma.staffMember.findFirst({
      where: { OR: [{ authUserId: user.id }, { email }] },
    })

    if (existing) {
      // If the record exists but has a different authUserId, link it to the new auth user
      if (existing.authUserId !== user.id) {
        const updated = await prisma.staffMember.update({
          where: { id: existing.id },
          data: { authUserId: user.id, fullName },
          select: { id: true, fullName: true, email: true, role: true },
        })
        return NextResponse.json({ success: true, data: updated }, { status: 200 })
      }
      return NextResponse.json(
        { success: true, data: { id: existing.id, fullName: existing.fullName, email: existing.email, role: existing.role } },
        { status: 200 }
      )
    }

    // Check if this is the first staff member (make them OWNER)
    const staffCount = await prisma.staffMember.count({
      where: { isDeleted: false },
    })
    let role: 'OWNER' | 'STAFF' = 'STAFF'
    if (staffCount === 0) {
      // If OWNER_SETUP_KEY is configured, require it to claim the OWNER role
      const setupKey = process.env.OWNER_SETUP_KEY
      if (setupKey) {
        const providedKey = body.ownerSetupKey
        if (providedKey !== setupKey) {
          return NextResponse.json(
            { success: false, error: 'Invalid or missing owner setup key' },
            { status: 403 }
          )
        }
      }
      role = 'OWNER'
    }

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
