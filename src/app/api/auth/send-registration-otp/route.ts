import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendRegistrationOtpEmail } from '@/lib/email'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name is required'),
})

function generateOtp(): string {
  const bytes = randomBytes(4)
  const num = bytes.readUInt32BE(0) % 1_000_000
  return num.toString().padStart(6, '0')
}

/**
 * POST /api/auth/send-registration-otp
 * Generates a 6-digit OTP and sends it via Resend for email verification during registration.
 * Reuses the PasswordResetOtp table (works for both flows).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = schema.safeParse(body)
    if (!input.success) {
      return NextResponse.json(
        { success: false, error: input.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const email = input.data.email.toLowerCase().trim()

    // Rate limit: max 3 per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCount = await prisma.passwordResetOtp.count({
      where: { email, createdAt: { gte: oneHourAgo } },
    })
    if (recentCount >= 3) {
      // Don't reveal rate limit — return success
      return NextResponse.json({ success: true })
    }

    // Invalidate previous unused OTPs
    await prisma.passwordResetOtp.updateMany({
      where: { email, used: false },
      data: { used: true },
    })

    // Generate and store OTP
    const otp = generateOtp()
    const otpHash = createHash('sha256').update(otp).digest('hex')

    await prisma.passwordResetOtp.create({
      data: {
        email,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    // Send via Resend
    await sendRegistrationOtpEmail(email, otp)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/auth/send-registration-otp error:', error)
    return NextResponse.json({ success: true }) // Don't reveal errors
  }
}
