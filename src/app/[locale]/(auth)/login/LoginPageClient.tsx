'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import OAuthButtons from '@/components/auth/OAuthButtons'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

const inputClasses = 'w-full rounded-xl bg-white/90 py-3.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 disabled:opacity-40 border border-white/20 focus:border-[#C9A84C]/50 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)]'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('rate') || msg.includes('too many')) {
        setServerError('Too many login attempts. Please wait a moment and try again.')
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setServerError('Connection error. Please check your internet and try again.')
      } else {
        // Generic message for all auth failures to prevent email enumeration
        setServerError('Incorrect email or password. Please try again.')
      }
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
      <div
        className="rounded-2xl p-8 sm:p-10"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ color: '#f0ece4' }}
          >
            Welcome Back
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'rgba(201, 168, 76, 0.85)' }}>
            Sign in to your account
          </p>
        </div>

        <OAuthButtons locale={locale} />

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
          <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(240, 236, 228, 0.35)' }}>
            or sign in with email
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          {/* Email */}
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
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={isSubmitting}
                className={`${inputClasses} pl-11 pr-4`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-xs" style={{ color: '#f87171' }}>{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.85)' }}>
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs transition-colors duration-200 hover:text-[#C9A84C]"
                style={{ color: 'rgba(240, 236, 228, 0.65)' }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]" style={{ color: '#C9A84C' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-required="true"
                aria-describedby={errors.password ? 'password-error' : undefined}
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
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs" style={{ color: '#f87171' }}>{errors.password.message}</p>
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
            {/* Shimmer effect */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                animation: 'shimmer 2s infinite',
              }}
            />
            {isSubmitting ? (
              <span className="relative inline-flex items-center">
                <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="relative">Sign in</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm" style={{ color: 'rgba(240, 236, 228, 0.65)' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium transition-colors duration-200 hover:text-[#E8C97A]"
            style={{ color: '#C9A84C' }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-fade-in-up">
          <div
            className="rounded-2xl p-8 sm:p-10 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="h-8 w-48 mx-auto rounded-lg mb-3" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="h-4 w-32 mx-auto rounded" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
