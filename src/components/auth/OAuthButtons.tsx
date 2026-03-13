'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Provider } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

interface OAuthButtonsProps {
  locale: string
}

const providers: { id: Provider; label: string; icon: React.ReactNode }[] = [
  {
    id: 'google',
    label: 'Continue with Google',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
]

export default function OAuthButtons({ locale }: OAuthButtonsProps) {
  const [loading, setLoading] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuth = async (provider: Provider) => {
    setLoading(provider)
    setError(null)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/${locale}/callback`

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      })

      if (oauthError) {
        setError(oauthError.message)
        setLoading(null)
      }
      // If no error, the browser will redirect to the provider
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            color: '#f87171',
          }}
        >
          {error}
        </div>
      )}

      {providers.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          disabled={loading !== null}
          onClick={() => handleOAuth(id)}
          className="group relative flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f0ece4',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
              e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)'
              e.currentTarget.style.boxShadow =
                '0 4px 24px rgba(201, 168, 76, 0.08)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {loading === id ? (
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#C9A84C' }} />
          ) : (
            icon
          )}
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
