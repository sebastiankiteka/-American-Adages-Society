// Helper functions for API routes
import { auth } from './auth'
import { supabase } from './supabase'

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

// Track view
export async function trackView(
  targetType: string,
  targetId: string,
  userId?: string,
  ipAddress?: string
) {
  await supabase.from('views').insert({
    target_type: targetType,
    target_id: targetId,
    user_id: userId,
    ip_address: ipAddress,
  })
}

