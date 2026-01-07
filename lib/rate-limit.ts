/**
 * Lightweight in-memory rate limiting
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 15 * 60 * 1000, maxRequests: 10 }
): RateLimitResult {
  const now = Date.now()
  const key = identifier

  // Get or create entry
  let entry = store[key]

  // If entry doesn't exist or has expired, create new one
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + options.windowMs,
    }
    store[key] = entry
  }

  // Increment count
  entry.count++

  // Check if limit exceeded
  const allowed = entry.count <= options.maxRequests
  const remaining = Math.max(0, options.maxRequests - entry.count)

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare

  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'

  return ip.trim()
}


