import type { Metadata } from 'next'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: {
    default: 'Authentication',
    template: '%s | Magic Spa Center',
  },
  description: 'Sign in to your Magic Spa Center account to manage your luxury spa business.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
      style={{
        background: 'linear-gradient(160deg, #0a0a0f 0%, #0f1018 30%, #12131e 60%, #0a0a0f 100%)',
      }}
    >
      {/* Ambient glow — top right */}
      <div
        className="pointer-events-none absolute -top-[30%] -right-[10%] h-[700px] w-[700px] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent 70%)' }}
      />
      {/* Ambient glow — bottom left */}
      <div
        className="pointer-events-none absolute -bottom-[20%] -left-[15%] h-[600px] w-[600px] rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent 70%)' }}
      />
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Centered content */}
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo & branding — always visible */}
        <div className="mb-10 text-center animate-fade-in-up">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #C9A84C, #E8C97A)',
              boxShadow: '0 8px 40px rgba(201, 168, 76, 0.25), 0 0 80px rgba(201, 168, 76, 0.08)',
            }}
          >
            <Sparkles className="h-8 w-8 text-[#0a0a0f]" />
          </div>

          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              background: 'linear-gradient(135deg, #C9A84C 0%, #E8C97A 40%, #C9A84C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Magic Spa Center
          </h1>

          <p className="mt-2 text-sm tracking-wide" style={{ color: 'rgba(201, 168, 76, 0.35)' }}>
            LUXURY SPA MANAGEMENT
          </p>
        </div>

        {/* Form card */}
        {children}

        {/* Bottom decorative element */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
          <div className="h-px w-8" style={{ background: 'linear-gradient(to right, transparent, #C9A84C)' }} />
          <div className="h-1 w-1 rounded-full" style={{ backgroundColor: '#C9A84C' }} />
          <div className="h-px w-8" style={{ background: 'linear-gradient(to left, transparent, #C9A84C)' }} />
        </div>
      </div>
    </div>
  )
}
