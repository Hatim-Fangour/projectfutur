# Project Memory - Magic Spa Center Platform

## Project Overview
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- Prisma ORM with PostgreSQL (Supabase) -- migrated from MySQL in Phase 1
- Package manager: npm
- React 19, Zod v4, sonner for toasts
- next-intl for i18n (en/fr), Stripe for payments, Supabase Realtime

## Architecture Rules (from implementation doc)
- Business logic in `src/lib/services/` -- never in API routes or components
- API routes thin: validate -> call service -> return response
- All API responses: `{ success, data?, error?, pagination? }`
- Soft delete only: `isDeleted` + `deletedAt` fields
- Always paginate list queries
- Use `select` in Prisma -- never return full models
- `withAuth(handler, { permission: 'xxx' })` -- pass options object, NOT string

## Phase Completion Status
- Phase 1: COMPLETE -- Prisma schema migrated to PostgreSQL, Supabase clients created
- Phase 2: COMPLETE -- Auth & authorization (permissions, withAuth HOF, auth pages, middleware)
- Phase 3: COMPLETE -- All services, API routes, api-client, pages connected to real data
- Phase 4: COMPLETE -- i18n with next-intl, messages/en.json + messages/fr.json, LanguageSwitcher
- Phase 5: COMPLETE -- Stripe integration (checkout, payment intent, manual, webhook, components)
- Phase 6: COMPLETE -- Supabase Realtime, live calendar + notifications, auto notification triggers
- Phase 7: COMPLETE -- Luxury design system, UI components, page styling, loading/error pages, metadata

## Key File Locations
- Schema: `prisma/schema.prisma` (PostgreSQL, 16 models)
- Prisma client: `src/lib/prisma.ts`
- Supabase clients: `src/lib/supabase/{client,server,admin,middleware}.ts`
- API client: `src/lib/api-client.ts` (typed, fetch-based, all resources incl. paymentApi)
- Auth: `src/lib/auth/permissions.ts`, `src/lib/api/withAuth.ts`
- Auth provider: `src/providers/AuthProvider.tsx`
- Realtime provider: `src/providers/RealtimeProvider.tsx`
- Middleware: `src/middleware.ts` (next-intl + Supabase auth combined)
- i18n: `src/i18n/routing.ts`, `src/i18n/request.ts`, `messages/{en,fr}.json`
- Stripe: `src/lib/stripe.ts` (server-side instance, webhook verification)
- Payment service: `src/lib/services/payment.service.ts`
- Payment components: `src/components/payments/` (CheckoutButton, PaymentForm, ManualPaymentForm, PaymentHistory)
- Notification triggers: `src/lib/services/notification-triggers.ts`
- Route groups: `src/app/[locale]/(auth)/` and `src/app/[locale]/(dashboard)/`
- Root layout: `src/app/layout.tsx` (minimal: fonts + body only)
- Locale layout: `src/app/[locale]/layout.tsx` (providers: NextIntl, Theme, Auth, Realtime, Toaster)
- Services: `src/lib/services/` (appointment, customer, staff, service-catalog, finance, dashboard, note, inventory, notification, payment, notification-triggers)

## Realtime Architecture (Phase 6)
- RealtimeProvider subscribes to Supabase postgres_changes on: appointments, notifications, inventory_items
- Event-based subscription model: `onAppointmentChange(cb)`, `onNotificationChange(cb)`, `onInventoryChange(cb)`
- Callbacks registered via `useRealtime()` hook, returns unsubscribe function
- Throttle: max one dispatch per table per 2 seconds (createThrottle utility)
- Reconnection: exponential backoff (1s initial, 30s max) via `subscribeRef` pattern
- Notification filtering: only dispatches notifications matching current user's ID
- Calendar page: silently refetches on appointment changes (no loading spinner)
- NotificationBell: realtime updates + 60s fallback polling (was 30s polling only)
- Notification triggers are fire-and-forget (void promise, caught errors logged)
- Triggers: appointment created -> notify therapist, status changed -> notify therapist + managers on cancel/no-show, inventory low stock -> notify managers/owners
- StaffMember.authUserId links to Supabase auth user ID for notification targeting
- PostgreSQL table names (@@map): appointments, notifications, inventory_items

## Important Patterns
- Zod v4: use `.issues` not `.errors` on ZodError
- Supabase clients use fallback values for env vars to survive build without `.env`
- Next.js 16 shows "middleware deprecated, use proxy" warning -- cosmetic only
- Page pattern: useState for data/loading/dialog, useCallback for fetch, useEffect to trigger
- All CRUD dialogs: loading spinner, disabled fields while submitting, success/error toasts
- Calendar: react-big-calendar + moment.js, drag-and-drop with optimistic API updates
- `import { Prisma } from '@prisma/client'` -- value import needed for `Prisma.Decimal`
- Avoid circular useCallback deps: use ref pattern (subscribeRef) for mutual references
- React lint: avoid setState in effects -- use derived values instead (effectiveIsConnected)

## Phase 7 Design System
- Luxury components: `src/components/ui/` (glass-card, luxury-button, stat-card, page-header, luxury-badge, skeleton-luxury, luxury-table, luxury-error)
- CSS variables: gold, champagne, deep-plum, rose-gold, ivory, charcoal in globals.css
- Animations: fadeInUp, fadeIn, shimmer, goldPulse, slideInRight, scaleIn, float
- Server wrapper pattern: client pages moved to *Client.tsx, page.tsx exports metadata + renders client
- 404 pages: `src/app/[locale]/not-found.tsx` and `src/app/not-found.tsx`
- Report: `reports/final-implementation-report.md`

## Known Technical Debt
- Sass `@import` deprecation warnings from calendar styles (not blocking)
- `moment.js` still used in calendar/booking -- replace with `date-fns`
- Some older files in customers/ still have `@ts-nocheck` and `any` types
- Most page components still have hardcoded English strings -- need useTranslations()
- 299 pre-existing lint issues (none from Phase 4-7 code)
- shadcn/ui sidebar.tsx has Math.random in render (React purity lint error)

## Dependencies
- Added in Phase 1: @supabase/supabase-js, @supabase/ssr
- Added in Phase 3: @radix-ui/react-switch (shadcn Switch)
- Added in Phase 4: next-intl
- Added in Phase 5: stripe, @stripe/stripe-js, @stripe/react-stripe-js
