import type { Metadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch adage data for metadata
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanadagessociety.org'
  let adage: { adage: string; definition: string; updated_at?: string } | null = null

  try {
    const response = await fetch(`${baseUrl}/api/adages/${params.id}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })
    const result = await response.json()
    if (result.success && result.data) {
      adage = result.data
    }
  } catch (error) {
    // Fallback metadata if fetch fails
  }

  const title = adage ? `"${adage.adage}" | Archive | American Adages Society` : 'Adage | Archive | American Adages Society'
  const description = adage
    ? `${adage.definition.substring(0, 155)}...`
    : 'Explore this adage in the American Adages Society archive.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    alternates: {
      canonical: `/archive/${params.id}`,
    },
  }
}

export default function AdageDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

