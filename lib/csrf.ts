/**
 * Basic CSRF protection using double-submit cookie pattern
 * Lightweight implementation for Next.js API routes
 */

import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'

const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_COOKIE_NAME = 'csrf-token'

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Get CSRF token from request cookie
 */
export function getCsrfTokenFromCookie(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null
}

/**
 * Get CSRF token from request header
 */
export function getCsrfTokenFromHeader(request: NextRequest): string | null {
  return request.headers.get(CSRF_TOKEN_HEADER) || null
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(request: NextRequest): boolean {
  const cookieToken = getCsrfTokenFromCookie(request)
  const headerToken = getCsrfTokenFromHeader(request)

  if (!cookieToken || !headerToken) {
    return false
  }

  // Tokens must match (double-submit pattern)
  return cookieToken === headerToken
}

/**
 * Set CSRF token cookie in response
 */
export function setCsrfCookie(response: Response, token: string): void {
  response.headers.set(
    'Set-Cookie',
    `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Secure=${process.env.NODE_ENV === 'production'}`
  )
}


