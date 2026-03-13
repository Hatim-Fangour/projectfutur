import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

/**
 * next-intl middleware handles locale detection, prefix, and redirects.
 */
const intlMiddleware = createMiddleware(routing)

/**
 * Auth pages that do not require authentication (locale-stripped paths).
 */
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/callback']

/**
 * Routes that should be skipped by middleware entirely.
 */
function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp')
  )
}

/**
 * Strip the locale prefix to get the "logical" route path.
 * e.g. "/fr/login" -> "/login", "/en/calendar" -> "/calendar"
 */
function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return '/'
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1)
    }
  }
  return pathname
}

function isPublicRoute(logicalPath: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => logicalPath === route || logicalPath.startsWith(`${route}/`)
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, etc.
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next()
  }

  // Run the intl middleware first to handle locale detection/redirect
  const intlResponse = intlMiddleware(request)

  // Get the logical path (without locale prefix) for auth checks
  const logicalPath = stripLocale(pathname)

  // Refresh the Supabase session and get user state
  const { user } = await updateSession(request)

  // Detect the current locale from the pathname (or default)
  let currentLocale = routing.defaultLocale
  for (const locale of routing.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      currentLocale = locale
      break
    }
  }

  // Unauthenticated user trying to access protected route
  if (!user && !isPublicRoute(logicalPath)) {
    const loginUrl = new URL(`/${currentLocale}/login`, request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user trying to access auth pages (login, register, etc.)
  if (user && isPublicRoute(logicalPath)) {
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url))
  }

  return intlResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
