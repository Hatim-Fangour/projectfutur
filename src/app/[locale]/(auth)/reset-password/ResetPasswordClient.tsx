'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

const resetPasswordSchema = z
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

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

const inputClasses = 'w-full rounded-xl bg-white/90 py-3.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 disabled:opacity-40 border border-white/20 focus:border-[#C9A84C]/50 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)]'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      setServerError(
        error.message.includes('same_password')
          ? 'New password must be different from your current password.'
          : error.message
      )
      return
    }
    setSuccess(true)
    setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 2000)
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
            Password updated
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 236, 228, 0.4)' }}>
            Redirecting you to the dashboard...
          </p>
          <div className="mt-6 mx-auto w-48 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(201, 168, 76, 0.1)' }}>
            <div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #C9A84C, #dbb960)',
                animation: 'progressFill 2s ease-in-out forwards',
              }}
            />
          </div>
          <style>{`
            @keyframes progressFill {
              from { width: 0%; }
              to { width: 100%; }
            }
          `}</style>
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
            Reset your password
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'rgba(201, 168, 76, 0.45)' }}>
            Enter your new password below
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

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.5)' }}>
              New Password
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

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(201, 168, 76, 0.5)' }}>
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[15px] w-[15px]" style={{ color: '#C9A84C' }} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your new password"
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
            {isSubmitting ? (
              <span className="relative inline-flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </span>
            ) : (
              <span className="relative">Reset password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
