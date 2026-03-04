import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in browser/client components.
 * Uses the anon key which respects Row Level Security policies.
 *
 * During build/SSR without env vars, a placeholder URL is used.
 * The client will fail at runtime if env vars are not set, which is correct.
 */
export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321'
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
