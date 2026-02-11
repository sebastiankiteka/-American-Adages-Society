import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog & Announcements | American Adages Society',
  description: 'Updates on AAS programs, initiatives, and reflections on language, culture, and the wisdom embedded in our everyday expressions.',
  openGraph: {
    title: 'Blog & Announcements | American Adages Society',
    description: 'Updates on AAS programs, initiatives, and reflections on language and culture.',
    type: 'website',
  },
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}











