import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Magic Spa Center',
    template: '%s | Magic Spa Center',
  },
  description:
    'Premium luxury spa management platform. Manage appointments, staff, services, inventory, and finances with elegance.',
  keywords: [
    'spa management',
    'luxury spa',
    'appointment booking',
    'salon software',
    'beauty business',
  ],
  authors: [{ name: 'Magic Spa Center' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Magic Spa Center',
    title: 'Magic Spa Center',
    description:
      'Premium luxury spa management platform. Manage appointments, staff, services, inventory, and finances with elegance.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * Root layout: provides fonts and global styles.
 * Locale-specific providers are in [locale]/layout.tsx.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
