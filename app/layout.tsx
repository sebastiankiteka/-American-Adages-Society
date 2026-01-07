import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import SessionProvider from '@/components/SessionProvider'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'American Adages Society | Big Wisdom, small sentences.',
  description: 'The American Adages Society explores the timeless wisdom within language, preserving and interpreting adages as cultural artifacts.',
  keywords: ['adages', 'proverbs', 'American sayings', 'language', 'culture', 'wisdom', 'University of Texas', 'UT Austin'],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/Favicon Logo AAS.jpeg" type="image/jpeg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B7355" />
        {/* Blocking script to set theme before React hydrates - prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('darkMode');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = saved !== null ? saved === 'true' : prefersDark;
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Silently fail if localStorage is not available
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          <SessionProvider>
            <Navigation />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </SessionProvider>
        </ErrorBoundary>
        <Script
          id="register-sw"
          strategy="afterInteractive"
        >
          {`
            if ('serviceWorker' in navigator && typeof window !== 'undefined') {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((reg) => {
                    // Service Worker registered successfully
                    // Logging disabled in production for performance
                  })
                  .catch((err) => {
                    // Silently fail in production, log in development
                    if (typeof console !== 'undefined' && console.error) {
                      console.error('Service Worker registration failed', err);
                    }
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}

