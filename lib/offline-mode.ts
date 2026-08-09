/**
 * Offline data mode — use bundled sample data instead of Supabase.
 *
 * Enable:  NEXT_PUBLIC_USE_OFFLINE_DATA=true
 * Disable: remove the var or set to false (Supabase again)
 */
export function isOfflineDataMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_OFFLINE_DATA === 'true'
}
