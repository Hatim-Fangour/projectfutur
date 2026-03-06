'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Loader2, User, Mail, Lock, Eye, EyeOff, CheckCircle, Copy, Check, RefreshCw, Shield, Sparkles } from 'lucide-react'
import OAuthButtons from '@/components/auth/OAuthButtons'

// --- Schemas ---

const step1Schema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

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

type Step1Data = z.infer<typeof step1Schema>
type PasswordData = z.infer<typeof passwordSchema>

// --- Helpers ---

function generateSecurePassword(length = 20): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => chars[b % chars.length]).join('')
}

const inputClasses = 'w-full rounded-xl bg-white/90 py-3.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 disabled:opacity-40 border border-white/20 focus:border-[#C9A84C]/50 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)]'

// --- Step Indicator ---

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const labels = ['Details', 'Verify', 'Password']
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full transition-all duration-500"
              style={{
                background: step <= current
                  ? 'linear-gradient(135deg, #C9A84C, #dbb960)'
                  : 'rgba(255, 255, 255, 0.1)',
                boxShadow: step <= current ? '0 0 12px rgba(201, 168, 76, 0.4)' : 'none',
              }}
            />
            <span
              className="text-[10px] uppercase tracking-wider font-medium"
              style={{ color: step <= current ? '#C9A84C' : 'rgba(240, 236, 228, 0.25)' }}
            >
              {labels[step - 1]}
            </span>
          </div>
          {step < 3 && (
            <div
              className="h-px w-8 mb-5 transition-all duration-500"
              style={{ background: step < current ? '#C9A84C' : 'rgba(255, 255, 255, 0.06)' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// --- OTP Input ---

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (val: string) => void
  disabled: boolean
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Build a 6-slot array: each slot is a single digit or ''
  const getDigits = useCallback((): string[] => {
    const chars = value.split('').slice(0, 6)
    while (chars.length < 6) chars.push('')
    return chars
  }, [value])

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return
    const arr = getDigits()
    arr[index] = char
    onChange(arr.join(''))
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !getDigits()[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      onChange(pasted)
      const focusIdx = Math.min(pasted.length, 5)
      inputRefs.current[focusIdx]?.focus()
    }
  }

  const digits = getDigits()

  return (
    <div className="flex justify-center gap-3">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          placeholder="-"
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          style={{
            width: '48px',
            height: '56px',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 600,
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#1a1a1a',
            border: digit ? '2px solid rgba(201, 168, 76, 0.5)' : '2px solid rgba(255, 255, 255, 0.15)',
            outline: 'none',
            transition: 'all 0.3s',
            boxShadow: digit ? '0 0 0 3px rgba(201, 168, 76, 0.12)' : 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = '2px solid rgba(201, 168, 76, 0.5)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 168, 76, 0.12)'
          }}
          onBlur={(e) => {
            if (!e.currentTarget.value) {
              e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.15)'
              e.currentTarget.style.boxShadow = 'none'
            }
          }}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  )
}

// --- Main Component ---

export default function RegisterPage() {
  const router = useRouter()
  const locale = useLocale()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Step 1 data persisted across steps
  const [userData, setUserData] = useState({ fullName: '', email: '' })

  // Step 2 OTP
  const [otpCode, setOtpCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Step 3 password
  const [passwordMode, setPasswordMode] = useState<'generate' | 'custom' | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  // Step 1 form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { fullName: '', email: '' },
  })

  // Step 3 form
  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  // --- Step 1: Send OTP ---
  const handleStep1 = async (data: Step1Data) => {
    setServerError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: { data: { full_name: data.fullName } },
      })
      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('rate') || msg.includes('too many') || msg.includes('rate_limit')) {
          setServerError('Too many attempts. Please wait a few minutes and try again.')
        } else if (msg.includes('valid email') || msg.includes('invalid')) {
          setServerError('Please enter a valid email address.')
        } else {
          setServerError('Failed to send verification code. Please try again.')
        }
        return
      }
      setUserData({ fullName: data.fullName, email: data.email })
      setResendCooldown(60)
      setStep(2)
    } catch {
      setServerError('Unable to connect. Please check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return
    setServerError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: userData.email,
        token: otpCode,
        type: 'email',
      })
      if (verifyError) {
        const msg = verifyError.message.toLowerCase()
        if (msg.includes('expired')) {
          setServerError('Code expired. Please request a new one.')
        } else if (msg.includes('invalid') || msg.includes('incorrect')) {
          setServerError('Invalid code. Please check and try again.')
        } else {
          setServerError('Verification failed. Please try again.')
        }
        return
      }

      // Create StaffMember via API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userData.fullName,
          email: userData.email,
          authUserId: verifyData.user?.id,
        }),
      })
      const result = await res.json()
      if (!result.success && !result.error?.includes('already exists')) {
        setServerError('Failed to complete registration. Please try again.')
        return
      }

      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  // --- Resend OTP ---
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setServerError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email: userData.email,
        options: { data: { full_name: userData.fullName } },
      })
      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('rate') || msg.includes('too many')) {
          setServerError('Too many attempts. Please wait a few minutes and try again.')
        } else {
          setServerError('Failed to resend code. Please try again.')
        }
        return
      }
      setResendCooldown(60)
      setOtpCode('')
    } catch {
      setServerError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // --- Step 3: Set Password ---
  const handleSetPassword = async (password: string) => {
    setServerError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setServerError('Failed to set password. Please try again.')
        return
      }
      setSuccess(true)
      setTimeout(() => router.push(`/${locale}/calendar`), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomPasswordSubmit = async (data: PasswordData) => {
    await handleSetPassword(data.password)
  }

  const handleGeneratedPasswordSubmit = async () => {
    if (!generatedPassword) return
    await handleSetPassword(generatedPassword)
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- Gold button ---
  const GoldButton = ({
    onClick,
    type = 'button',
    disabled = false,
    children,
  }: {
    onClick?: () => void
    type?: 'button' | 'submit'
    disabled?: boolean
    children: React.ReactNode
  }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="group relative mt-2 w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: 'linear-gradient(135deg, #C9A84C, #dbb960)',
        color: '#0a0a0f',
        boxShadow: '0 4px 24px rgba(201, 168, 76, 0.2)',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.boxShadow = '0 8px 40px rgba(201, 168, 76, 0.35)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(201, 168, 76, 0.2)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          animation: 'shimmer 2s infinite',
        }}
      />
      {loading ? (
        <span className="relative inline-flex items-center">
          <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
          Please wait...
        </span>
      ) : (
        <span className="relative">{children}</span>
      )}
    </button>
  )

  // --- Success screen ---
  if (success) {
    return (
      <div className="animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
        <div
          className="rounded-2xl p-8 sm:p-10 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: 'rgba(201, 168, 76, 0.08)',
              border: '1px solid rgba(201, 168, 76, 0.2)',
              boxShadow: '0 0 40px rgba(201, 168, 76, 0.1)',
            }}
          >
            <CheckCircle className="h-7 w-7" style={{ color: '#C9A84C' }} />
          </div>
          <h2 className="text-2xl font-semibold mb-3" style={{ color: '#f0ece4' }}>
            Account created
          </h2>
          <p className="text-sm mb-2 leading-relaxed" style={{ color: 'rgba(240, 236, 228, 0.4)' }}>
            Your account is ready. Redirecting you to the dashboard...
          </p>
          <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin" style={{ color: '#C9A84C' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
      <div
        className="rounded-2xl p-8 sm:p-10"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        }}
      >
        <div className="text-center mb-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: '#f0ece4' }}>
            {step === 1 && 'Create your account'}
            {step === 2 && 'Verify your email'}
            {step === 3 && 'Set your password'}
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'rgba(201, 168, 76, 0.85)' }}>
            {step === 1 && 'Register as a spa center owner'}
            {step === 2 && `We sent a 6-digit code to ${userData.email}`}
            {step === 3 && 'Choose how you want to secure your account'}
          </p>
        </div>

        <StepIndicator current={step} />

        {/* Step 1: OAuth + Name/Email */}
        {step === 1 && (
          <>
            <OAuthButtons locale={locale} />
            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
              <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(240, 236, 228, 0.35)' }}>
                or register with email
              </span>
              <div className="h-px flex-1" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
            </div>

            <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-5">
              {serverError && (
                <div
                  role="alert"
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                  }}
                >
                  {serverError}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="fullName" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.85)' }}>
                  Full Name
                </label>
                <div className="relative">
                  <User aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]" style={{ color: '#C9A84C' }} />
                  <input
                    id="fullName"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    aria-required="true"
                    aria-describedby={step1Form.formState.errors.fullName ? 'fullName-error' : undefined}
                    disabled={loading}
                    className={`${inputClasses} pl-11 pr-4`}
                    {...step1Form.register('fullName')}
                  />
                </div>
                {step1Form.formState.errors.fullName && (
                  <p id="fullName-error" className="text-xs" style={{ color: '#f87171' }}>{step1Form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.85)' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]" style={{ color: '#C9A84C' }} />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-required="true"
                    aria-describedby={step1Form.formState.errors.email ? 'email-error' : undefined}
                    disabled={loading}
                    className={`${inputClasses} pl-11 pr-4`}
                    {...step1Form.register('email')}
                  />
                </div>
                {step1Form.formState.errors.email && (
                  <p id="email-error" className="text-xs" style={{ color: '#f87171' }}>{step1Form.formState.errors.email.message}</p>
                )}
              </div>

              <GoldButton type="submit">Send verification code</GoldButton>
            </form>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div className="space-y-6">
            {serverError && (
              <div
                role="alert"
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                }}
              >
                {serverError}
              </div>
            )}

            <OtpInput value={otpCode} onChange={setOtpCode} disabled={loading} />

            <GoldButton onClick={handleVerifyOtp} disabled={otpCode.length !== 6}>
              Verify code
            </GoldButton>

            <div className="flex items-center justify-center gap-4">
              {resendCooldown > 0 ? (
                <p className="text-xs" style={{ color: 'rgba(240, 236, 228, 0.35)' }}>
                  Resend code in {resendCooldown}s
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors duration-200 hover:text-[#E8C97A] disabled:opacity-40"
                  style={{ color: '#C9A84C' }}
                >
                  <RefreshCw className="h-3 w-3" />
                  Resend code
                </button>
              )}
              <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
              <button
                onClick={() => { setStep(1); setOtpCode(''); setServerError(null); setResendCooldown(0) }}
                disabled={loading}
                className="text-xs font-medium transition-colors duration-200 hover:text-[#f87171] disabled:opacity-40"
                style={{ color: 'rgba(240, 236, 228, 0.4)' }}
              >
                Use a different email
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Set Password */}
        {step === 3 && (
          <div className="space-y-5">
            {serverError && (
              <div
                role="alert"
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                }}
              >
                {serverError}
              </div>
            )}

            {/* Mode selection cards */}
            {passwordMode === null && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setPasswordMode('generate')
                    setGeneratedPassword(generateSecurePassword())
                  }}
                  className="w-full rounded-xl p-4 text-left transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    background: 'rgba(201, 168, 76, 0.06)',
                    border: '1px solid rgba(201, 168, 76, 0.15)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: 'rgba(201, 168, 76, 0.1)' }}
                    >
                      <Sparkles className="h-5 w-5" style={{ color: '#C9A84C' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#f0ece4' }}>Generate secure password</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(240, 236, 228, 0.4)' }}>
                        We&apos;ll create a strong 20-character password for you
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPasswordMode('custom')}
                  className="w-full rounded-xl p-4 text-left transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <Shield className="h-5 w-5" style={{ color: 'rgba(240, 236, 228, 0.6)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#f0ece4' }}>Create my own password</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(240, 236, 228, 0.4)' }}>
                        At least 8 characters with mixed case and a number
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Generated password view */}
            {passwordMode === 'generate' && (
              <div className="space-y-4">
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(201, 168, 76, 0.04)',
                    border: '1px solid rgba(201, 168, 76, 0.12)',
                  }}
                >
                  <label className="text-xs font-medium uppercase tracking-wider block mb-2" style={{ color: 'rgba(201, 168, 76, 0.85)' }}>
                    Your secure password
                  </label>
                  <div className="flex items-center gap-2">
                    <code
                      className="flex-1 rounded-lg px-3 py-2.5 text-sm font-mono break-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#f0ece4',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      {generatedPassword}
                    </code>
                    <button
                      onClick={copyPassword}
                      className="flex-shrink-0 rounded-lg p-2.5 transition-all duration-200"
                      style={{
                        background: copied ? 'rgba(34, 197, 94, 0.1)' : 'rgba(201, 168, 76, 0.08)',
                        border: `1px solid ${copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(201, 168, 76, 0.15)'}`,
                        color: copied ? '#22c55e' : '#C9A84C',
                      }}
                      aria-label="Copy password"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: 'rgba(240, 236, 228, 0.35)' }}>
                    Save this password in a password manager before continuing.
                  </p>
                </div>

                <button
                  onClick={() => setGeneratedPassword(generateSecurePassword())}
                  className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors duration-200 hover:text-[#E8C97A]"
                  style={{ color: '#C9A84C' }}
                >
                  <RefreshCw className="h-3 w-3" />
                  Generate another
                </button>

                <GoldButton onClick={handleGeneratedPasswordSubmit}>
                  Set password & continue
                </GoldButton>

                <button
                  onClick={() => { setPasswordMode('custom'); setGeneratedPassword(''); passwordForm.reset() }}
                  className="w-full text-center text-xs transition-colors duration-200 hover:text-[#E8C97A]"
                  style={{ color: 'rgba(240, 236, 228, 0.4)' }}
                >
                  I&apos;d rather create my own password
                </button>
              </div>
            )}

            {/* Custom password form */}
            {passwordMode === 'custom' && (
              <form onSubmit={passwordForm.handleSubmit(handleCustomPasswordSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.85)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]" style={{ color: '#C9A84C' }} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 chars, mixed case + number"
                      autoComplete="new-password"
                      aria-required="true"
                      aria-describedby={passwordForm.formState.errors.password ? 'password-error' : undefined}
                      disabled={loading}
                      className={`${inputClasses} pl-11 pr-11`}
                      {...passwordForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 hover:text-[#C9A84C]"
                      style={{ color: 'rgba(201, 168, 76, 0.6)' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.password && (
                    <p id="password-error" className="text-xs" style={{ color: '#f87171' }}>{passwordForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.85)' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]" style={{ color: '#C9A84C' }} />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      aria-required="true"
                      aria-describedby={passwordForm.formState.errors.confirmPassword ? 'confirmPassword-error' : undefined}
                      disabled={loading}
                      className={`${inputClasses} pl-11 pr-11`}
                      {...passwordForm.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 hover:text-[#C9A84C]"
                      style={{ color: 'rgba(201, 168, 76, 0.6)' }}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p id="confirmPassword-error" className="text-xs" style={{ color: '#f87171' }}>{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <GoldButton type="submit">Set password & continue</GoldButton>

                <button
                  type="button"
                  onClick={() => { setPasswordMode('generate'); setGeneratedPassword(generateSecurePassword()) }}
                  className="w-full text-center text-xs transition-colors duration-200 hover:text-[#E8C97A]"
                  style={{ color: 'rgba(240, 236, 228, 0.4)' }}
                >
                  Generate a secure password instead
                </button>
              </form>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-sm" style={{ color: 'rgba(240, 236, 228, 0.65)' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium transition-colors duration-200 hover:text-[#E8C97A]"
            style={{ color: '#C9A84C' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
