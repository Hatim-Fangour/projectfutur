import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

/**
 * Luxury 404 page with gold accents and spa-themed messaging.
 */
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="text-center animate-fade-in-up max-w-lg w-full">
        {/* Gold 404 number */}
        <h1
          className="text-8xl sm:text-9xl font-bold mb-4 gold-gradient-text"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          404
        </h1>

        <GlassCard className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold-light/5 border border-gold/20">
            <Sparkles className="h-7 w-7 gold-text" />
          </div>

          <h2
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Page Not Found
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            It seems this page has wandered off for a relaxation session.
            Let us guide you back to your sanctuary.
          </p>

          <Link href="/">
            <Button className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-white hover:shadow-gold">
              Return to Dashboard
            </Button>
          </Link>
        </GlassCard>

        {/* Decorative bottom flourish */}
        <div className="mt-8 flex items-center justify-center gap-3 text-muted-foreground">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/40" />
          <span className="text-xs tracking-widest uppercase">Magic Spa Center</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/40" />
        </div>
      </div>
    </div>
  )
}
