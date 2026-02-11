/**
 * CSRF middleware helper
 * Use this to verify CSRF tokens in API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrfToken } from '@/lib/csrf'
import { ApiResponse } from '@/lib/api-helpers'

/**
 * CSRF protection middleware
 * Returns null if valid, or an error response if invalid
 */
export function requireCsrfToken(request: NextRequest): NextResponse | null {
  // Skip CSRF for GET requests
  if (request.method === 'GET' || request.method === 'HEAD') {
    return null
  }

  // Verify CSRF token
  if (!verifyCsrfToken(request)) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Invalid or missing CSRF token',
      },
      { status: 403 }
    )
  }

  return null
}














