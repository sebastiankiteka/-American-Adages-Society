/**
 * Utility functions for the American Adages Society website
 */

/**
 * Calculate estimated reading time in minutes
 * Based on average reading speed of 200-250 words per minute
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 225 // Average reading speed
  const wordCount = content.trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return Math.max(1, minutes) // Minimum 1 minute
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) return '1 min read'
  return `${minutes} min read`
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Generate a slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Get base URL for canonical URLs
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://americanadagessociety.org'
}














