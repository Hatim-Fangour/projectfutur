import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Root-level 404 page for requests outside the [locale] scope.
 * Uses inline styles since it cannot rely on the locale layout providers.
 */
export default function RootNotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="text-center max-w-lg w-full animate-fade-in-up">
        <h1
          className="text-8xl sm:text-9xl font-bold mb-4 gold-gradient-text"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          404
        </h1>

        <div className="glass-card rounded-xl p-8 text-center">
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
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-muted-foreground">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/40" />
          <span className="text-xs tracking-widest uppercase">Magic Spa Center</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/40" />
        </div>
      </div>
    </div>
  )
}
