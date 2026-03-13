import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { resetPasswordWithToken } from '@/lib/services/password-reset.service'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  resetToken: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    ),
})

/**
 * POST /api/auth/reset-password
 * Resets the user's password using the temporary reset token from OTP verification.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parseResult = resetPasswordSchema.safeParse(body)
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstIssue?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, resetToken, password } = parseResult.data
    const result = await resetPasswordWithToken(email, resetToken, password)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('POST /api/auth/reset-password error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
