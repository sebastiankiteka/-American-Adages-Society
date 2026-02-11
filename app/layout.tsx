import { ThemeProvider } from '@/components/theme-provider'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import SessionProvider from '@/components/SessionProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import PageViewTracker from '@/components/PageViewTracker'

export const metadata: Metadata = {
  title: 'American Adages Society | Big Wisdom, small sentences.',
  description:
    'The American Adages Society explores the timeless wisdom within language, preserving and interpreting adages as cultural artifacts.',
  keywords: [
    'adages',
    'proverbs',
    'American sayings',
    'language',
    'culture',
    'wisdom',
    'University of Texas',
    'UT Austin',
  ],
  authors: [{ name: 'American Adages Society' }],
  openGraph: {
    title: 'American Adages Society',
    description: 'Big Wisdom, small sentences. Exploring the timeless wisdom within language.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'American Adages Society',
    description: 'Big Wisdom, small sentences.',
  },
  icons: {
    icon: '/Favicon Logo AAS.jpeg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme || (theme !== 'dark' && theme !== 'light')) {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    theme = systemTheme;
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          <ErrorBoundary>
            <SessionProvider>
              <PageViewTracker />
              <Suspense
                fallback={
                  <nav className="bg-nav-bg text-text-inverse sticky top-0 z-50 shadow-lg relative border-b-2 border-accent-primary/20 h-20" />
                }
              >
                <Navigation />
              </Suspense>
              <main className="min-h-screen">{children}</main>
              <Footer />
            </SessionProvider>
          </ErrorBoundary>
        </ThemeProvider>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator && typeof window !== 'undefined') {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
