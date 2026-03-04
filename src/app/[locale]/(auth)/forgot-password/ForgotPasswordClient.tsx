'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

const inputClasses = 'w-full rounded-xl bg-white/90 py-3.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 disabled:opacity-40 border border-white/20 focus:border-[#C9A84C]/50 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)]'

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setServerError(error.message)
      return
    }
    setEmailSent(true)
  }

  if (emailSent) {
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
            <Mail className="h-6 w-6" style={{ color: '#C9A84C' }} />
          </div>
          <h2 className="text-2xl font-semibold mb-3" style={{ color: '#f0ece4' }}>
            Check your email
          </h2>
          <p className="text-sm mb-1.5" style={{ color: 'rgba(240, 236, 228, 0.4)' }}>
            We sent a password reset link to
          </p>
          <p className="text-sm font-medium mb-6" style={{ color: '#C9A84C' }}>
            {getValues('email')}
          </p>
          <Link href="/login">
            <button
              className="inline-flex items-center rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-[#C9A84C]/15"
              style={{
                background: 'rgba(201, 168, 76, 0.08)',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                color: '#C9A84C',
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </button>
          </Link>
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
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'rgba(201, 168, 76, 0.45)' }}>
            Enter your email to receive a reset link
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
                Sending...
              </span>
            ) : (
              <span className="relative">Send reset link</span>
            )}
          </button>
        </form>

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
      </div>
    </div>
  )
}
