import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /[locale]/auth/callback
 * Handles the OAuth callback from Supabase after provider authentication.
 * Exchanges the auth code for a session, ensures a StaffMember record exists,
 * then redirects to the dashboard.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=auth_callback_failed`, origin)
    )
  }

  try {
    const supabase = await createClient()

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('OAuth code exchange error:', exchangeError.message)
      return NextResponse.redirect(
        new URL(`/${locale}/login?error=auth_callback_failed`, origin)
      )
    }

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('OAuth getUser error:', userError?.message)
      return NextResponse.redirect(
        new URL(`/${locale}/login?error=auth_callback_failed`, origin)
      )
    }

    // Auto-create StaffMember if one doesn't exist for this user
    const existing = await prisma.staffMember.findFirst({
      where: { authUserId: user.id },
    })

    if (!existing) {
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'User'
      const email = user.email || ''

      const staffCount = await prisma.staffMember.count({
        where: { isDeleted: false },
      })
      const role = staffCount === 0 ? 'OWNER' : 'STAFF'

      await prisma.staffMember.create({
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
      })
    }

    return NextResponse.redirect(new URL(`/${locale}`, origin))
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=auth_callback_failed`, origin)
    )
  }
}
