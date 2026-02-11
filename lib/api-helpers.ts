// Helper function to extract IP address from request
export function getClientIP(request: Request): string | undefined {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }
  
  // For localhost/dev, we can't get real IP, but we can use a placeholder
  // This helps distinguish between different sessions
  return undefined // Will be null in database, which is fine
}

// Helper functions for API routes
import { auth } from './auth'
import { supabase, supabaseAdmin } from './supabase'

// Role hierarchy for permission checking
const roleHierarchy: Record<string, number> = {
  banned: 0,
  restricted: 1,
  probation: 2,
  user: 3,
  moderator: 4,
  admin: 5,
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0)
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Get current user session with full user data from database
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user) {
    return null
  }

  const userId = (session.user as any).id
  if (!userId) {
    return null
  }

  // Fetch full user data including email_verified from database
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, username, display_name, role, email_verified')
    .eq('id', userId)
    .is('deleted_at', null)
    .single()

  if (error || !user) {
    // If DB fetch fails, log error but try to return session data with email_verified as false
    // This prevents blocking users if there's a temporary DB issue
    console.error('Failed to fetch user from database:', error)
    return {
      ...session.user,
      email_verified: false, // Default to false if we can't fetch from DB
    } as any
  }

  // Always return database data, which includes email_verified
  // Ensure email_verified is a boolean (handle null values)
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    display_name: user.display_name,
    role: user.role,
    email_verified: user.email_verified === true, // Explicitly convert to boolean
  }
}

// Check if user has required role
export async function requireRole(requiredRole: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  if (!hasRole((user as any).role, requiredRole)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

// Check if user is admin
export async function requireAdmin() {
  return requireRole('admin')
}

// Check if user is moderator or admin
export async function requireModerator() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  const role = (user as any).role
  if (role !== 'admin' && role !== 'moderator') {
    throw new Error('Insufficient permissions')
  }
  return user
}

// Soft delete helper
export function softDeleteQuery(table: string, id: string) {
  return supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
}

// Restore soft-deleted item
export function restoreQuery(table: string, id: string) {
  return supabase
    .from(table)
    .update({ deleted_at: null })
    .eq('id', id)
}

// Hide content (for moderation)
export function hideQuery(table: string, id: string) {
  return supabase
    .from(table)
    .update({ hidden_at: new Date().toISOString() })
    .eq('id', id)
}

// Unhide content
export function unhideQuery(table: string, id: string) {
  return supabase
    .from(table)
    .update({ hidden_at: null })
    .eq('id', id)
}

// Log activity
export async function logActivity(
  userId: string | undefined,
  actionType: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, any>
) {
  await supabase.from('activity_log').insert({
    user_id: userId,
    action_type: actionType,
    target_type: targetType,
    target_id: targetId,
    details: details || {},
  })
}

// Calculate vote score dynamically
export async function getVoteScore(targetType: string, targetId: string): Promise<number> {
  const { data, error } = await supabase
    .from('votes')
    .select('value')
    .eq('target_type', targetType)
    .eq('target_id', targetId)

  if (error || !data) {
    return 0
  }

  return data.reduce((sum, vote) => sum + vote.value, 0)
}

// Get view count
export async function getViewCount(targetType: string, targetId: string): Promise<number> {
  const { count, error } = await supabase
    .from('views')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', targetType)
    .eq('target_id', targetId)

  if (error) {
    return 0
  }

  return count || 0
}

// Track view and update unique visitors
export async function trackView(
  targetType: string,
  targetId: string,
  userId?: string,
  ipAddress?: string
) {
  try {
    // Insert view record using supabaseAdmin to bypass RLS
    const { error: insertError } = await supabaseAdmin.from('views').insert({
      target_type: targetType,
      target_id: targetId,
      user_id: userId || null,
      ip_address: ipAddress || null,
    })

    if (insertError) {
      console.error(`[trackView] Failed to insert view for ${targetType} ${targetId}:`, insertError.message)
      return // Don't update count if insert failed
    }

    // Update unique visitors table
    try {
      const { error: uniqueVisitorError } = await supabaseAdmin.rpc('update_unique_visitor', {
        p_user_id: userId || null,
        p_ip_address: ipAddress || null,
      })
      
      if (uniqueVisitorError) {
        console.error(`[trackView] Failed to update unique visitor:`, uniqueVisitorError.message)
        // Don't fail the whole operation if unique visitor update fails
      }
    } catch (error: any) {
      console.error(`[trackView] Error updating unique visitor:`, error.message)
      // Continue even if unique visitor update fails
    }

    // Update views_count on the target table (denormalized counter)
    // First get current count, then increment
    if (targetType === 'adage') {
      const { data, error: selectError } = await supabaseAdmin
        .from('adages')
        .select('views_count')
        .eq('id', targetId)
        .single()
      
      if (selectError) {
        console.error(`[trackView] Failed to get views_count for adage ${targetId}:`, selectError.message)
        return
      }
      
      if (data) {
        const { error: updateError } = await supabaseAdmin
          .from('adages')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', targetId)

        if (updateError) {
          console.error(`[trackView] Failed to update views_count for adage ${targetId}:`, updateError.message)
        }
      }
    } else if (targetType === 'blog') {
      const { data, error: selectError } = await supabaseAdmin
        .from('blog_posts')
        .select('views_count')
        .eq('id', targetId)
        .single()
      
      if (selectError) {
        console.error(`[trackView] Failed to get views_count for blog ${targetId}:`, selectError.message)
        return
      }
      
      if (data) {
        const { error: updateError } = await supabaseAdmin
          .from('blog_posts')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', targetId)

        if (updateError) {
          console.error(`[trackView] Failed to update views_count for blog ${targetId}:`, updateError.message)
        }
      }
    } else if (targetType === 'forum_thread') {
      const { data, error: selectError } = await supabaseAdmin
        .from('forum_threads')
        .select('views_count')
        .eq('id', targetId)
        .single()
      
      if (selectError) {
        console.error(`[trackView] Failed to get views_count for forum_thread ${targetId}:`, selectError.message)
        return
      }
      
      if (data) {
        const { error: updateError } = await supabaseAdmin
          .from('forum_threads')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', targetId)

        if (updateError) {
          console.error(`[trackView] Failed to update views_count for forum_thread ${targetId}:`, updateError.message)
        }
      }
    }
  } catch (error: any) {
    // Log but don't break page loads if analytics fail
    console.error(`[trackView] Unexpected error tracking view for ${targetType} ${targetId}:`, error.message)
  }
}

