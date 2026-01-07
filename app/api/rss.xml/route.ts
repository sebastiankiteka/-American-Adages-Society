import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Fetch published blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, excerpt, content, published_at, slug, author_name, updated_at')
      .eq('published', true)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(20)

    if (error) {
      return new NextResponse('Error generating RSS feed', { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanadagessociety.org'
    const siteName = 'American Adages Society'
    const siteDescription = 'Updates on AAS programs, initiatives, and reflections on language, culture, and the wisdom embedded in our everyday expressions.'

    // Generate RSS XML
    const rssItems = (posts || []).map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug || post.id}`
      const pubDate = new Date(post.published_at).toUTCString()
      const description = post.excerpt || post.content?.substring(0, 200) || ''
      
      // Escape XML special characters
      const escapeXml = (str: string) => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')
      }

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      ${post.author_name ? `<author>${escapeXml(post.author_name)}</author>` : ''}
    </item>`
    }).join('\n')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName} - Blog</title>
    <link>${baseUrl}</link>
    <description>${siteDescription}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch (error: any) {
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}


