import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).regex(/^\d{6}$/),
})

/**
 * POST /api/auth/verify-registration-otp
 * Verifies a 6-digit OTP for registration email verification.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = schema.safeParse(body)
    if (!input.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      )
    }

    const email = input.data.email.toLowerCase().trim()
    const otpHash = createHash('sha256').update(input.data.otp).digest('hex')

    // Find the latest unused, unexpired OTP for this email
    const record = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    // Check attempts
    if (record.attempts >= 3) {
      await prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { used: true },
      })
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please request a new code.' },
        { status: 400 }
      )
    }

    // Increment attempts
    await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    })

    // Verify hash
    if (record.otpHash !== otpHash) {
      return NextResponse.json(
        { success: false, error: 'Invalid code. Please check and try again.' },
        { status: 400 }
      )
    }

    // Mark as used
    await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { used: true },
    })

    return NextResponse.json({ success: true, data: { verified: true } })
  } catch (error) {
    console.error('POST /api/auth/verify-registration-otp error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}
