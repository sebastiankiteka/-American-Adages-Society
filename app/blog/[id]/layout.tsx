import type { Metadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanadagessociety.org'
  let post: { title: string; excerpt?: string; content?: string; published_at?: string } | null = null

  try {
    // Try slug first, then ID
    let response = await fetch(`${baseUrl}/api/blog-posts/slug/${params.id}`, {
      next: { revalidate: 3600 },
    })
    let result = await response.json()
    
    if (!result.success) {
      response = await fetch(`${baseUrl}/api/blog-posts/${params.id}`, {
        next: { revalidate: 3600 },
      })
      result = await response.json()
    }

    if (result.success && result.data) {
      post = result.data
    }
  } catch (error) {
    // Fallback metadata
  }

  const title = post ? `${post.title} | Blog | American Adages Society` : 'Blog Post | American Adages Society'
  const description = post?.excerpt || post?.content?.substring(0, 155) || 'Read this post from the American Adages Society blog.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post?.published_at,
    },
    alternates: {
      canonical: `/blog/${params.id}`,
    },
  }
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

