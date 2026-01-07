// Helper functions for role management and permissions

export type PublicRole = 'user' | 'banned' | 'moderator' | 'admin'
export type PrivateRole = 'restricted' | 'probation'
export type UserRole = PublicRole | PrivateRole

// Map internal roles to public roles (hide restricted/probation)
export function getPublicRole(role: string): PublicRole {
  if (role === 'restricted' || role === 'probation') {
    return 'user' // Show as regular user publicly
  }
  return role as PublicRole
}

// Check if user can perform action based on role
export function canPerformAction(userRole: string, action: string): boolean {
  // Banned users can't do anything
  if (userRole === 'banned') {
    return false
  }

  // Restricted users have limited permissions
  if (userRole === 'restricted') {
    const allowedActions = ['view', 'read', 'save_adage']
    return allowedActions.includes(action)
  }

  // Probation users have most permissions but with restrictions
  if (userRole === 'probation') {
    const restrictedActions = ['post_forum', 'comment', 'vote']
    // Probation users can do these but with cooldowns/monitoring
    return true // Allow but may be rate-limited elsewhere
  }

  // Regular users, moderators, admins have full permissions (except admin-only actions)
  return true
}

// Check if user can post/comment (for probation cooldowns)
export function canPost(userRole: string, lastPostTime?: Date): boolean {
  if (userRole === 'banned' || userRole === 'restricted') {
    return false
  }

  if (userRole === 'probation' && lastPostTime) {
    // Probation users have 1 hour cooldown between posts
    const cooldownMs = 60 * 60 * 1000 // 1 hour
    return Date.now() - lastPostTime.getTime() > cooldownMs
  }

  return true
}

// Check if user can vote
export function canVote(userRole: string): boolean {
  return userRole !== 'banned' && userRole !== 'restricted'
}

// Check if user can comment
export function canComment(userRole: string): boolean {
  return userRole !== 'banned' && userRole !== 'restricted'
}



