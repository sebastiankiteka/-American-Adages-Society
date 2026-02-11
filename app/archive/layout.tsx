import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Archive | American Adages Society',
  description: 'Explore our comprehensive, searchable dictionary of American adages with detailed definitions, origins, historical context, and cultural interpretations.',
  openGraph: {
    title: 'Archive | American Adages Society',
    description: 'Explore our comprehensive dictionary of American adages with detailed definitions, origins, and cultural context.',
    type: 'website',
  },
  alternates: {
    canonical: '/archive',
  },
}

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}














