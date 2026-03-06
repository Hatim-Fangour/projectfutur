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

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        if (typeof document === 'undefined') return []
        return document.cookie.split('; ').filter(Boolean).map((c) => {
          const [name, ...rest] = c.split('=')
          return { name, value: decodeURIComponent(rest.join('=')) }
        })
      },
      setAll(cookies) {
        if (typeof document === 'undefined') return
        cookies.forEach(({ name, value, options }) => {
          let cookie = `${name}=${encodeURIComponent(value)}; path=${options?.path ?? '/'}`
          if (options?.maxAge) cookie += `; max-age=${options.maxAge}`
          if (options?.sameSite) cookie += `; samesite=${options.sameSite}`
          document.cookie = cookie
        })
      },
    },
  })
}
