import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyPasswordResetOtp } from '@/lib/services/password-reset.service'

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
})

/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit OTP and returns a temporary reset token.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parseResult = verifyOtpSchema.safeParse(body)
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstIssue?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, otp } = parseResult.data
    const result = await verifyPasswordResetOtp(email, otp)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, data: { resetToken: result.resetToken } },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/auth/verify-otp error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
