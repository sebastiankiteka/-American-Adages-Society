import { NextResponse } from 'next/server'

/**
 * GET /api/docs - API Documentation endpoint
 * Returns JSON documentation of available API endpoints
 */
export async function GET() {
  const docs = {
    title: 'American Adages Society API Documentation',
    version: '1.0.0',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://americanadagessociety.org',
    endpoints: {
      adages: {
        'GET /api/adages': {
          description: 'List all adages with optional filters',
          parameters: {
            search: 'string - Search in adage text and definition',
            tag: 'string - Filter by tag',
            featured: 'boolean - Filter featured adages',
            limit: 'number - Results per page (default: 100)',
            offset: 'number - Pagination offset',
          },
          authentication: 'None required',
          response: 'Array of adage objects',
        },
        'GET /api/adages/[id]': {
          description: 'Get single adage with full details',
          parameters: {
            id: 'string - Adage UUID',
          },
          authentication: 'None required',
          response: 'Adage object with variants, translations, related adages, etc.',
        },
        'POST /api/adages': {
          description: 'Create new adage',
          authentication: 'Admin only',
          body: 'Adage object',
          response: 'Created adage object',
        },
        'PUT /api/adages/[id]': {
          description: 'Update adage',
          authentication: 'Admin only',
          body: 'Partial adage object',
          response: 'Updated adage object',
        },
        'DELETE /api/adages/[id]': {
          description: 'Soft delete adage',
          authentication: 'Admin only',
          response: 'Success message',
        },
        'GET /api/adages/[id]/versions': {
          description: 'Get version history for an adage',
          authentication: 'Admin only',
          response: 'Array of version objects',
        },
        'GET /api/adages/export': {
          description: 'Export adages as CSV',
          parameters: {
            format: 'string - Export format (csv or json, default: csv)',
          },
          authentication: 'Admin only',
          response: 'CSV file or JSON array',
        },
      },
      blog: {
        'GET /api/blog-posts': {
          description: 'List all blog posts with optional filters',
          parameters: {
            search: 'string - Search in title, excerpt, content',
            tag: 'string - Filter by tag',
            published: 'boolean - Filter by published status',
            dateFrom: 'string - Filter by date (ISO format)',
            dateTo: 'string - Filter by date (ISO format)',
            limit: 'number - Results per page',
            offset: 'number - Pagination offset',
          },
          authentication: 'None required (only published posts for non-admins)',
          response: 'Array of blog post objects',
        },
        'GET /api/blog-posts/[id]': {
          description: 'Get single blog post with full details',
          authentication: 'None required (only published posts for non-admins)',
          response: 'Blog post object with comments, votes, etc.',
        },
        'GET /api/blog-posts/slug/[slug]': {
          description: 'Get blog post by slug',
          authentication: 'None required',
          response: 'Blog post object',
        },
        'GET /api/blog-posts/[id]/versions': {
          description: 'Get version history for a blog post',
          authentication: 'Admin only',
          response: 'Array of version objects',
        },
      },
      comments: {
        'GET /api/comments': {
          description: 'Get comments for a target',
          parameters: {
            target_type: 'string - Type: adage, blog, user, event',
            target_id: 'string - Target UUID',
          },
          authentication: 'None required',
          response: 'Array of comment objects',
        },
        'POST /api/comments': {
          description: 'Create a comment',
          authentication: 'Authenticated user',
          body: {
            target_type: 'string',
            target_id: 'string',
            content: 'string (3-5000 chars)',
            parent_id: 'string (optional)',
          },
          response: 'Created comment object',
        },
      },
      votes: {
        'POST /api/votes': {
          description: 'Create or toggle a vote',
          authentication: 'Authenticated user',
          body: {
            target_type: 'string',
            target_id: 'string',
            value: 'number (-1 or 1)',
          },
          response: 'Vote object',
        },
      },
      users: {
        'GET /api/users/me': {
          description: 'Get current user profile',
          authentication: 'Authenticated user',
          response: 'User object',
        },
        'PUT /api/users/me': {
          description: 'Update current user profile',
          authentication: 'Authenticated user',
          body: 'Partial user object',
          response: 'Updated user object',
        },
      },
      rss: {
        'GET /api/rss.xml': {
          description: 'RSS feed for blog posts',
          authentication: 'None required',
          response: 'RSS XML feed',
        },
      },
    },
    authentication: {
      method: 'NextAuth.js with email/password',
      session: 'JWT-based sessions',
      roles: ['admin', 'moderator', 'user', 'restricted', 'probation', 'banned'],
    },
    rateLimiting: {
      comments: '10 per 15 minutes per user',
      contact: '5 per 15 minutes per IP',
      votes: '30 per 15 minutes per user/IP',
    },
    caching: {
      adages: '5 minutes (list), 10 minutes (detail)',
      blogPosts: '5 minutes (list), 10 minutes (detail)',
      rss: '1 hour',
    },
  }

  return NextResponse.json(docs, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600',
    },
  })
}














