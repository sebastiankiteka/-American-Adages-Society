// Supabase client configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { isOfflineDataMode } from '@/lib/offline-mode'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const offline = isOfflineDataMode()

if (!offline && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables')
}

// Placeholder URL keeps createClient valid when offline mode skips live DB calls
const resolvedUrl = supabaseUrl || 'https://offline.local.supabase.co'
const resolvedAnon = supabaseAnonKey || 'offline-anon-key'
const resolvedService = serviceRoleKey || resolvedAnon

export const supabase: SupabaseClient = createClient(resolvedUrl, resolvedAnon)

export const supabaseAdmin: SupabaseClient = createClient(resolvedUrl, resolvedService, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
