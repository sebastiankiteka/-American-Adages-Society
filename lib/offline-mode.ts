/**
 * Offline data mode — use bundled sample data instead of Supabase.
 *
 * Enable either (recommended: both on Vercel while DB is down):
 *   USE_OFFLINE_DATA=true              (server-only, always runtime)
 *   NEXT_PUBLIC_USE_OFFLINE_DATA=true  (also drives the archive banner)
 *
 * Disable: set both to false (or remove) and redeploy.
 */
export function isOfflineDataMode(): boolean {
  // Bracket access avoids Next.js inlining a stale build-time value for NEXT_PUBLIC_*
  const serverFlag = process.env.USE_OFFLINE_DATA
  const publicFlag = process.env['NEXT_PUBLIC_USE_OFFLINE_DATA']
  return serverFlag === 'true' || publicFlag === 'true'
}

/** True when a Supabase call failed because the project is paused / unreachable. */
export function isLikelyDbUnavailable(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === 'string'
        ? error
        : String(error ?? '')
  return /fetch failed|Failed to fetch|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|timeout|project (is )?paused|502|503|504/i.test(
    msg
  )
}
