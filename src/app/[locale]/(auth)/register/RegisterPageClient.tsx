'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, User, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
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

type RegisterFormData = z.infer<typeof registerSchema>

const inputClasses = 'w-full rounded-xl bg-white/90 py-3.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 disabled:opacity-40 border border-white/20 focus:border-[#C9A84C]/50 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)]'

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } },
    })

    if (signUpError) {
      setServerError(
        signUpError.message.includes('already registered')
          ? 'An account with this email already exists. Please sign in instead.'
          : signUpError.message
      )
      return
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: data.fullName, email: data.email }),
    })

    const result = await res.json()
    if (!result.success) {
      setServerError(result.error ?? 'Failed to create account profile')
      return
    }

    setSuccess(true)
  }

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
            Check your email
          </h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(240, 236, 228, 0.4)' }}>
            We&apos;ve sent a confirmation link to your email.
            Click it to verify your account.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-[#C9A84C]/15"
            style={{
              background: 'rgba(201, 168, 76, 0.08)',
              border: '1px solid rgba(201, 168, 76, 0.2)',
              color: '#C9A84C',
            }}
          >
            Back to sign in
          </button>
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
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: '#f0ece4' }}>
            Create your account
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'rgba(201, 168, 76, 0.45)' }}>
            Register as a spa center owner
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div
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

          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.5)' }}>
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]" style={{ color: '#C9A84C' }} />
              <input
                id="fullName"
                placeholder="Jane Smith"
                autoComplete="name"
                disabled={isSubmitting}
                className={`${inputClasses} pl-11 pr-4`}
                {...register('fullName')}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs" style={{ color: '#f87171' }}>{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.5)' }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]" style={{ color: '#C9A84C' }} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isSubmitting}
                className={`${inputClasses} pl-11 pr-4`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs" style={{ color: '#f87171' }}>{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.5)' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]" style={{ color: '#C9A84C' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars, mixed case + number"
                autoComplete="new-password"
                disabled={isSubmitting}
                className={`${inputClasses} pl-11 pr-11`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 hover:text-[#C9A84C]"
                style={{ color: 'rgba(201, 168, 76, 0.6)' }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs" style={{ color: '#f87171' }}>{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.5)' }}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]" style={{ color: '#C9A84C' }} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                autoComplete="new-password"
                disabled={isSubmitting}
                className={`${inputClasses} pl-11 pr-11`}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 hover:text-[#C9A84C]"
                style={{ color: 'rgba(201, 168, 76, 0.6)' }}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs" style={{ color: '#f87171' }}>{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative mt-2 w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #C9A84C, #dbb960)',
              color: '#0a0a0f',
              boxShadow: '0 4px 24px rgba(201, 168, 76, 0.2)',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
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
            {isSubmitting ? (
              <span className="relative inline-flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="relative">Create account</span>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm" style={{ color: 'rgba(240, 236, 228, 0.3)' }}>
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
