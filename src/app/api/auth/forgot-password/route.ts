import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requestPasswordResetOtp } from '@/lib/services/password-reset.service'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

/**
 * POST /api/auth/forgot-password
 * Sends a 6-digit OTP to the user's email for password reset.
 * Always returns success to prevent email enumeration.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parseResult = forgotPasswordSchema.safeParse(body)
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstIssue?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    await requestPasswordResetOtp(parseResult.data.email)

    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('POST /api/auth/forgot-password error:', error)
    // Still return success to prevent enumeration
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
