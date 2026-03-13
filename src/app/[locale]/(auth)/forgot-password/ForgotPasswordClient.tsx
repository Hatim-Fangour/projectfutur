'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react'

// ── Shared Styles ──────────────────────────────────────────────

const inputClasses =
  'w-full rounded-xl bg-white/90 py-3.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 disabled:opacity-40 border border-white/20 focus:border-[#C9A84C]/50 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)]'

const cardStyle = {
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  boxShadow:
    '0 24px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
} as const

const goldButtonStyle = {
  background: 'linear-gradient(135deg, #C9A84C, #dbb960)',
  color: '#0a0a0f',
  boxShadow: '0 4px 24px rgba(201, 168, 76, 0.2)',
} as const

function GoldButton({
  children,
  disabled,
  type = 'submit',
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  type?: 'submit' | 'button'
  onClick?: () => void
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="group relative mt-2 w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
      style={goldButtonStyle}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow =
            '0 8px 40px rgba(201, 168, 76, 0.35)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          '0 4px 24px rgba(201, 168, 76, 0.2)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Shimmer effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          animation: 'shimmer 2s infinite',
        }}
      />
      <span className="relative">{children}</span>
    </button>
  )
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        color: '#f87171',
      }}
    >
      {message}
    </div>
  )
}

// ── Step Indicators ────────────────────────────────────────────

function StepIndicator({
  currentStep,
}: {
  currentStep: 1 | 2 | 3
}) {
  const steps = [
    { num: 1, label: 'Email' },
    { num: 2, label: 'Verify' },
    { num: 3, label: 'Reset' },
  ]

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300"
            style={{
              background:
                step.num <= currentStep
                  ? 'linear-gradient(135deg, #C9A84C, #dbb960)'
                  : 'rgba(255, 255, 255, 0.04)',
              color:
                step.num <= currentStep
                  ? '#0a0a0f'
                  : 'rgba(240, 236, 228, 0.3)',
              border:
                step.num <= currentStep
                  ? 'none'
                  : '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow:
                step.num === currentStep
                  ? '0 0 20px rgba(201, 168, 76, 0.3)'
                  : 'none',
            }}
          >
            {step.num < currentStep ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              step.num
            )}
          </div>
          <span
            className="text-xs font-medium hidden sm:inline"
            style={{
              color:
                step.num <= currentStep
                  ? 'rgba(201, 168, 76, 0.85)'
                  : 'rgba(240, 236, 228, 0.25)',
            }}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className="h-px w-6 sm:w-10 transition-all duration-300"
              style={{
                background:
                  step.num < currentStep
                    ? 'rgba(201, 168, 76, 0.4)'
                    : 'rgba(255, 255, 255, 0.06)',
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Step 1: Email Input ────────────────────────────────────────

const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

type EmailFormData = z.infer<typeof emailSchema>

function EmailStep({
  onSuccess,
}: {
  onSuccess: (email: string) => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: EmailFormData) => {
    setServerError(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      const json = await res.json()

      if (!res.ok && !json.success) {
        setServerError(json.error || 'Something went wrong')
        return
      }

      onSuccess(data.email)
    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  return (
    <>
      <div className="text-center mb-6">
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: 'rgba(201, 168, 76, 0.08)',
            border: '1px solid rgba(201, 168, 76, 0.2)',
          }}
        >
          <Mail className="h-5 w-5" style={{ color: '#C9A84C' }} />
        </div>
        <h2
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ color: '#f0ece4' }}
        >
          Forgot your password?
        </h2>
        <p
          className="mt-2 text-sm"
          style={{ color: 'rgba(201, 168, 76, 0.45)' }}
        >
          Enter your email to receive a verification code
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && <ErrorAlert message={serverError} />}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'rgba(201, 168, 76, 0.5)' }}
          >
            Email
          </label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]"
              style={{ color: '#C9A84C' }}
            />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-required="true"
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isSubmitting}
              className={`${inputClasses} pl-11 pr-4`}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-xs" style={{ color: '#f87171' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <GoldButton disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center">
              <Loader2
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin"
              />
              Sending code...
            </span>
          ) : (
            'Send verification code'
          )}
        </GoldButton>
      </form>
    </>
  )
}

// ── Step 2: OTP Verification ───────────────────────────────────

function OtpStep({
  email,
  onSuccess,
  onBack,
}: {
  email: string
  onSuccess: (resetToken: string) => void
  onBack: () => void
}) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Only allow digits
      const digit = value.replace(/\D/g, '').slice(-1)
      const newOtp = [...otp]
      newOtp[index] = digit
      setOtp(newOtp)

      // Auto-advance to next input
      if (digit && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [otp]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      if (e.key === 'ArrowRight' && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [otp]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, 6)
      if (pasted.length === 0) return

      const newOtp = [...otp]
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || ''
      }
      setOtp(newOtp)

      // Focus the next empty input or the last one
      const nextEmpty = newOtp.findIndex((d) => !d)
      inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus()
    },
    [otp]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) return

    setServerError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      })

      const json = await res.json()

      if (!json.success) {
        setServerError(json.error || 'Invalid code')
        // Clear OTP inputs on failure
        setOtp(Array(6).fill(''))
        inputRefs.current[0]?.focus()
        return
      }

      onSuccess(json.data.resetToken)
    } catch {
      setServerError('Network error. Please check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return
    setIsResending(true)
    setServerError(null)

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setResendCooldown(60)
      setOtp(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } catch {
      setServerError('Failed to resend code.')
    } finally {
      setIsResending(false)
    }
  }

  const isComplete = otp.every((d) => d !== '')

  return (
    <>
      <div className="text-center mb-6">
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: 'rgba(201, 168, 76, 0.08)',
            border: '1px solid rgba(201, 168, 76, 0.2)',
          }}
        >
          <ShieldCheck className="h-5 w-5" style={{ color: '#C9A84C' }} />
        </div>
        <h2
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ color: '#f0ece4' }}
        >
          Enter verification code
        </h2>
        <p
          className="mt-2 text-sm"
          style={{ color: 'rgba(240, 236, 228, 0.4)' }}
        >
          We sent a 6-digit code to
        </p>
        <p className="text-sm font-medium mt-1" style={{ color: '#C9A84C' }}>
          {email}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {serverError && <ErrorAlert message={serverError} />}

        {/* OTP Input Grid */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isSubmitting}
              aria-label={`Digit ${index + 1} of 6`}
              className="h-14 w-11 sm:h-16 sm:w-13 rounded-xl text-center text-xl sm:text-2xl font-bold outline-none transition-all duration-300 disabled:opacity-40"
              style={{
                background: digit
                  ? 'rgba(201, 168, 76, 0.08)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: digit
                  ? '1.5px solid rgba(201, 168, 76, 0.4)'
                  : '1.5px solid rgba(255, 255, 255, 0.08)',
                color: '#C9A84C',
                boxShadow: digit
                  ? '0 0 20px rgba(201, 168, 76, 0.1)'
                  : 'none',
                caretColor: '#C9A84C',
              }}
              onFocus={(e) => {
                e.currentTarget.style.border =
                  '1.5px solid rgba(201, 168, 76, 0.5)'
                e.currentTarget.style.boxShadow =
                  '0 0 24px rgba(201, 168, 76, 0.15)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = digit
                  ? '1.5px solid rgba(201, 168, 76, 0.4)'
                  : '1.5px solid rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.boxShadow = digit
                  ? '0 0 20px rgba(201, 168, 76, 0.1)'
                  : 'none'
              }}
            />
          ))}
        </div>

        <GoldButton disabled={isSubmitting || !isComplete}>
          {isSubmitting ? (
            <span className="inline-flex items-center">
              <Loader2
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin"
              />
              Verifying...
            </span>
          ) : (
            'Verify code'
          )}
        </GoldButton>
      </form>

      {/* Resend & Back */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className="text-sm transition-colors duration-200 disabled:cursor-not-allowed"
          style={{
            color:
              resendCooldown > 0
                ? 'rgba(240, 236, 228, 0.25)'
                : 'rgba(201, 168, 76, 0.7)',
          }}
        >
          {isResending ? (
            <span className="inline-flex items-center">
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Resending...
            </span>
          ) : resendCooldown > 0 ? (
            `Resend code in ${resendCooldown}s`
          ) : (
            "Didn't receive a code? Resend"
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-sm transition-colors duration-200 hover:text-[#C9A84C]"
          style={{ color: 'rgba(240, 236, 228, 0.3)' }}
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Use a different email
        </button>
      </div>
    </>
  )
}

// ── Step 3: New Password ───────────────────────────────────────

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must contain uppercase, lowercase, and a number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

function PasswordStep({
  email,
  resetToken,
  onSuccess,
}: {
  email: string
  resetToken: string
  onSuccess: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: PasswordFormData) => {
    setServerError(null)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          resetToken,
          password: data.password,
        }),
      })

      const json = await res.json()

      if (!json.success) {
        setServerError(json.error || 'Failed to reset password')
        return
      }

      onSuccess()
    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  return (
    <>
      <div className="text-center mb-6">
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: 'rgba(201, 168, 76, 0.08)',
            border: '1px solid rgba(201, 168, 76, 0.2)',
          }}
        >
          <KeyRound className="h-5 w-5" style={{ color: '#C9A84C' }} />
        </div>
        <h2
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ color: '#f0ece4' }}
        >
          Set new password
        </h2>
        <p
          className="mt-2 text-sm"
          style={{ color: 'rgba(201, 168, 76, 0.45)' }}
        >
          Choose a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && <ErrorAlert message={serverError} />}

        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'rgba(201, 168, 76, 0.5)' }}
          >
            New Password
          </label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]"
              style={{ color: '#C9A84C' }}
            />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, mixed case + number"
              autoComplete="new-password"
              aria-required="true"
              aria-describedby={errors.password ? 'pwd-error' : undefined}
              disabled={isSubmitting}
              className={`${inputClasses} pl-11 pr-11`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 hover:text-[#C9A84C]"
              style={{ color: 'rgba(201, 168, 76, 0.6)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Eye aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="pwd-error" className="text-xs" style={{ color: '#f87171' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'rgba(201, 168, 76, 0.5)' }}
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]"
              style={{ color: '#C9A84C' }}
            />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repeat your new password"
              autoComplete="new-password"
              aria-required="true"
              aria-describedby={
                errors.confirmPassword ? 'cpwd-error' : undefined
              }
              disabled={isSubmitting}
              className={`${inputClasses} pl-11 pr-11`}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 hover:text-[#C9A84C]"
              style={{ color: 'rgba(201, 168, 76, 0.6)' }}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Eye aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p
              id="cpwd-error"
              className="text-xs"
              style={{ color: '#f87171' }}
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <GoldButton disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center">
              <Loader2
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin"
              />
              Updating password...
            </span>
          ) : (
            'Reset password'
          )}
        </GoldButton>
      </form>
    </>
  )
}

// ── Success Screen ─────────────────────────────────────────────

function SuccessScreen() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login')
    }, 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="text-center">
      <div
        className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: 'rgba(201, 168, 76, 0.08)',
          border: '1px solid rgba(201, 168, 76, 0.2)',
          boxShadow: '0 0 40px rgba(201, 168, 76, 0.15)',
        }}
      >
        <CheckCircle className="h-7 w-7" style={{ color: '#C9A84C' }} />
      </div>
      <h2
        className="text-2xl font-semibold mb-3"
        style={{ color: '#f0ece4' }}
      >
        Password updated
      </h2>
      <p
        className="text-sm leading-relaxed mb-6"
        style={{ color: 'rgba(240, 236, 228, 0.4)' }}
      >
        Your password has been reset successfully.
        <br />
        Redirecting you to sign in...
      </p>
      <div
        className="mx-auto w-48 h-0.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(201, 168, 76, 0.1)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #C9A84C, #dbb960)',
            animation: 'progressFill 3s ease-in-out forwards',
          }}
        />
      </div>
      <style>{`
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      <Link href="/login">
        <button
          className="mt-6 inline-flex items-center rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-[#C9A84C]/15"
          style={{
            background: 'rgba(201, 168, 76, 0.08)',
            border: '1px solid rgba(201, 168, 76, 0.2)',
            color: '#C9A84C',
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to sign in
        </button>
      </Link>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────

type Step = 'email' | 'otp' | 'password' | 'success'

export default function ForgotPasswordClient() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')

  const currentStepNum: 1 | 2 | 3 =
    step === 'email' ? 1 : step === 'otp' ? 2 : 3

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
    >
      <div className="rounded-2xl p-8 sm:p-10" style={cardStyle}>
        {step !== 'success' && <StepIndicator currentStep={currentStepNum} />}

        {step === 'email' && (
          <EmailStep
            onSuccess={(e) => {
              setEmail(e)
              setStep('otp')
            }}
          />
        )}

        {step === 'otp' && (
          <OtpStep
            email={email}
            onSuccess={(token) => {
              setResetToken(token)
              setStep('password')
            }}
            onBack={() => setStep('email')}
          />
        )}

        {step === 'password' && (
          <PasswordStep
            email={email}
            resetToken={resetToken}
            onSuccess={() => setStep('success')}
          />
        )}

        {step === 'success' && <SuccessScreen />}

        {step === 'email' && (
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm transition-colors duration-200 hover:text-[#C9A84C]"
              style={{ color: 'rgba(240, 236, 228, 0.3)' }}
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
