import { randomBytes, createHash } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetOtpEmail } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Configuration ──────────────────────────────────────────────

/** OTP validity in minutes */
const OTP_EXPIRY_MINUTES = 10
/** Maximum verification attempts before OTP is invalidated */
const MAX_ATTEMPTS = 3
/** Maximum OTP requests per email per hour */
const MAX_REQUESTS_PER_HOUR = 3
/** Reset token validity in minutes (time window to set new password after OTP verification) */
const RESET_TOKEN_EXPIRY_MINUTES = 15

// ── Helpers ────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
function generateOtp(): string {
  // Use crypto.randomBytes for secure randomness
  const bytes = randomBytes(4)
  const num = bytes.readUInt32BE(0) % 1_000_000
  return num.toString().padStart(6, '0')
}

/**
 * Hashes an OTP using SHA-256. We use SHA-256 instead of bcrypt because:
 * - OTPs are short-lived (10 minutes)
 * - OTPs are 6 digits (brute force is limited by attempt count, not hash strength)
 * - SHA-256 is faster for verification within rate-limited attempts
 */
function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex')
}

/**
 * Verifies an OTP against its hash.
 */
function verifyOtpHash(otp: string, hash: string): boolean {
  return hashOtp(otp) === hash
}

/**
 * Generates a secure random token for the reset step.
 */
function generateResetToken(): string {
  return randomBytes(32).toString('hex')
}

// ── Service Functions ──────────────────────────────────────────

/**
 * Requests a password reset OTP for the given email.
 * - Rate limits to MAX_REQUESTS_PER_HOUR per email
 * - Generates and hashes a 6-digit OTP
 * - Sends the OTP via email
 * - Always returns success to avoid email enumeration
 */
export async function requestPasswordResetOtp(email: string): Promise<{
  success: boolean
  error?: string
}> {
  const normalizedEmail = email.toLowerCase().trim()

  try {
    // Rate limit: count OTPs created for this email in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCount = await prisma.passwordResetOtp.count({
      where: {
        email: normalizedEmail,
        createdAt: { gte: oneHourAgo },
      },
    })

    if (recentCount >= MAX_REQUESTS_PER_HOUR) {
      // Don't reveal rate limiting to prevent enumeration.
      // Log it server-side for monitoring.
      console.warn(`Rate limit hit for password reset OTP: ${normalizedEmail}`)
      return { success: true }
    }

    // Invalidate any existing unused OTPs for this email
    await prisma.passwordResetOtp.updateMany({
      where: {
        email: normalizedEmail,
        used: false,
        expiresAt: { gte: new Date() },
      },
      data: { used: true },
    })

    // Generate OTP and hash
    const otp = generateOtp()
    const otpHash = hashOtp(otp)
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    // Store the OTP record
    await prisma.passwordResetOtp.create({
      data: {
        email: normalizedEmail,
        otpHash,
        expiresAt,
      },
    })

    // Send email (fire-and-forget style but we log failures)
    const emailSent = await sendPasswordResetOtpEmail(normalizedEmail, otp)
    if (!emailSent) {
      console.error(`Failed to send OTP email to ${normalizedEmail}`)
    }

    return { success: true }
  } catch (error) {
    console.error('requestPasswordResetOtp error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Verifies an OTP and returns a temporary reset token.
 * - Checks OTP validity, expiration, and attempt count
 * - Increments attempt count on each try
 * - Returns a reset token on success
 */
export async function verifyPasswordResetOtp(
  email: string,
  otp: string
): Promise<{
  success: boolean
  resetToken?: string
  error?: string
}> {
  const normalizedEmail = email.toLowerCase().trim()

  try {
    // Find the most recent unused, non-expired OTP for this email
    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        email: normalizedEmail,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord) {
      return {
        success: false,
        error: 'Invalid or expired code. Please request a new one.',
      }
    }

    // Check attempt limit
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      // Mark as used (exhausted)
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      })
      return {
        success: false,
        error: 'Too many attempts. Please request a new code.',
      }
    }

    // Increment attempts
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    })

    // Verify the OTP
    if (!verifyOtpHash(otp, otpRecord.otpHash)) {
      const remaining = MAX_ATTEMPTS - (otpRecord.attempts + 1)
      if (remaining <= 0) {
        await prisma.passwordResetOtp.update({
          where: { id: otpRecord.id },
          data: { used: true },
        })
        return {
          success: false,
          error: 'Too many attempts. Please request a new code.',
        }
      }
      return {
        success: false,
        error: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      }
    }

    // OTP is valid - generate a reset token
    const resetToken = generateResetToken()

    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: {
        used: true,
        resetToken,
      },
    })

    return { success: true, resetToken }
  } catch (error) {
    console.error('verifyPasswordResetOtp error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Resets the user's password using the temporary reset token.
 * - Validates the reset token
 * - Uses Supabase Admin to update the user's password
 */
export async function resetPasswordWithToken(
  email: string,
  resetToken: string,
  newPassword: string
): Promise<{
  success: boolean
  error?: string
}> {
  const normalizedEmail = email.toLowerCase().trim()

  try {
    // Find the OTP record with this reset token
    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        email: normalizedEmail,
        resetToken,
        resetTokenUsed: false,
      },
    })

    if (!otpRecord) {
      return {
        success: false,
        error: 'Invalid or expired reset token. Please start over.',
      }
    }

    // Check if the reset token hasn't expired (created within RESET_TOKEN_EXPIRY_MINUTES)
    const tokenAge = Date.now() - otpRecord.createdAt.getTime()
    const maxAge = (OTP_EXPIRY_MINUTES + RESET_TOKEN_EXPIRY_MINUTES) * 60 * 1000
    if (tokenAge > maxAge) {
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { resetTokenUsed: true },
      })
      return {
        success: false,
        error: 'Reset token has expired. Please start over.',
      }
    }

    // Find the Supabase user by email using admin client
    const supabaseAdmin = createAdminClient()
    const { data: userList, error: listError } =
      await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('Failed to list users:', listError)
      return { success: false, error: 'Failed to reset password' }
    }

    const user = userList.users.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    )

    if (!user) {
      // Don't reveal that user doesn't exist
      return { success: false, error: 'Failed to reset password' }
    }

    // Update the password via Supabase Admin
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      })

    if (updateError) {
      console.error('Failed to update password:', updateError)
      if (updateError.message?.includes('same_password')) {
        return {
          success: false,
          error: 'New password must be different from your current password.',
        }
      }
      return { success: false, error: 'Failed to reset password' }
    }

    // Mark the reset token as used
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { resetTokenUsed: true },
    })

    return { success: true }
  } catch (error) {
    console.error('resetPasswordWithToken error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Cleanup: removes expired OTP records older than 24 hours.
 * Can be called periodically via a cron job or scheduled function.
 */
export async function cleanupExpiredOtps(): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  await prisma.passwordResetOtp.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })
}
