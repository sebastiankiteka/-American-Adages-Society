'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import CommentsSection from '@/components/CommentsSection'

interface PublicUserData {
  id: string
  username?: string
  display_name?: string
  bio?: string
  profile_image_url?: string
  created_at: string
  profile_private?: boolean
  stats?: {
    saved_adages: number
    collections: number
    comments: number
    friends?: number
  }
  public_collections?: Array<{
    id: string
    name: string
    description?: string
    created_at: string
  }>
  recent_comments?: Array<{
    id: string
    content: string
    target_type: string
    target_id: string
    created_at: string
    adage?: { id: string; adage: string }
    blog_post?: { id: string; title: string; slug: string }
  }>
  featured_comments?: Array<{
    id: string
    content: string
    target_type: string
    target_id: string
    created_at: string
    user?: { id: string; username?: string; display_name?: string; profile_image_url?: string }
    adage?: { id: string; adage: string }
    blog_post?: { id: string; title: string; slug: string }
  }>
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface FriendshipStatus {
  status: 'none' | 'pending' | 'accepted' | 'blocked' | 'self'
  direction?: 'outgoing' | 'incoming'
  friendship_id?: string
  friends_since?: string
}

function PublicProfileContent() {
  const params = useParams()
  const { data: session } = useSession()
  const userId = params.id as string
  const [userData, setUserData] = useState<PublicUserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${userId}`)
        const result: ApiResponse<PublicUserData> = await response.json()

        if (result.success && result.data) {
          setUserData(result.data)
        } else {
          setError(result.error || 'User not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserData()
      if (session) {
        fetchFriendshipStatus()
      }
    }
  }, [userId, session])

  const fetchFriendshipStatus = async () => {
    if (!session) return

    try {
      const response = await fetch(`/api/friends/status?user_id=${userId}`)
      const result: ApiResponse<FriendshipStatus> = await response.json()

      if (result.success && result.data) {
        setFriendshipStatus(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch friendship status:', err)
    }
  }

  const handleFriendAction = async (action: 'send' | 'accept' | 'remove' | 'unblock' | 'block') => {
    if (!session || processing) return

    setProcessing(true)
    try {
      if (action === 'send') {
        const response = await fetch('/api/friends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ friend_id: userId }),
        })
        const result: ApiResponse = await response.json()
        if (result.success) {
          fetchFriendshipStatus()
        } else {
          alert(result.error || 'Failed to send friend request')
        }
      } else if (action === 'block') {
        if (!confirm('Are you sure you want to block this user? They will not be able to send you friend requests or interact with you.')) {
          setProcessing(false)
          return
        }
        const response = await fetch('/api/friends/block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        })
        const result: ApiResponse = await response.json()
        if (result.success) {
          fetchFriendshipStatus()
          alert('User blocked successfully')
        } else {
          alert(result.error || 'Failed to block user')
        }
      } else if (action === 'accept') {
        const response = await fetch(`/api/friends/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'accept' }),
        })
        const result: ApiResponse = await response.json()
        if (result.success) {
          fetchFriendshipStatus()
        } else {
          alert(result.error || 'Failed to accept friend request')
        }
      } else if (action === 'remove') {
        const response = await fetch(`/api/friends/${userId}`, {
          method: 'DELETE',
        })
        const result: ApiResponse = await response.json()
        if (result.success) {
          fetchFriendshipStatus()
        } else {
          alert(result.error || 'Failed to remove friend')
        }
      } else if (action === 'unblock') {
        const response = await fetch(`/api/friends/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'unblock' }),
        })
        const result: ApiResponse = await response.json()
        if (result.success) {
          fetchFriendshipStatus()
        } else {
          alert(result.error || 'Failed to unblock user')
        }
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading profile...</p>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-text mb-4">{error || 'User not found'}</p>
          <Link href="/" className="text-accent-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = session && (session.user as any)?.id === userId

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {userData.profile_image_url ? (
              <img
                src={userData.profile_image_url}
                alt={userData.display_name || userData.username || 'User'}
                className="w-32 h-32 rounded-full object-cover border-4 border-accent-primary"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-accent-primary flex items-center justify-center text-text-inverse text-4xl font-bold">
                {(userData.display_name || userData.username || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-serif text-text-primary mb-2">
                {userData.display_name || userData.username || 'User'}
              </h1>
              {userData.username && (
                <p className="text-text-secondary mb-2">@{userData.username}</p>
              )}
              {userData.bio && (
                <p className="text-text-secondary leading-relaxed">{userData.bio}</p>
              )}
              <p className="text-sm text-text-metadata mt-4">
                Member since {new Date(userData.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
            <div className="flex gap-3">
              {isOwnProfile ? (
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Edit Profile
                </Link>
              ) : session && friendshipStatus && (
                <>
                  {friendshipStatus.status === 'none' && userData.profile_private ? (
                    <span className="px-4 py-2 bg-card-bg-muted text-text-metadata rounded-lg text-sm border border-border-medium">
                      Private Profile
                    </span>
                  ) : friendshipStatus.status === 'none' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFriendAction('send')}
                        disabled={processing}
                        className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                      >
                        {processing ? 'Sending...' : 'Add Friend'}
                      </button>
                      <button
                        onClick={() => handleFriendAction('block')}
                        disabled={processing}
                        className="px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors disabled:opacity-50 border border-error-text/30"
                      >
                        {processing ? 'Blocking...' : 'Block'}
                      </button>
                    </div>
                  )}
                  {friendshipStatus.status === 'pending' && friendshipStatus.direction === 'outgoing' && (
                    <span className="px-4 py-2 bg-warning-bg text-warning-text rounded-lg border border-warning-text/30">
                      Request Sent
                    </span>
                  )}
                  {friendshipStatus.status === 'pending' && friendshipStatus.direction === 'incoming' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFriendAction('accept')}
                        disabled={processing}
                        className="px-4 py-2 bg-success-bg text-success-text rounded-lg hover:bg-success-text/20 transition-colors disabled:opacity-50 border border-success-text/30"
                      >
                        {processing ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleFriendAction('remove')}
                        disabled={processing}
                        className="px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors disabled:opacity-50 border border-error-text/30"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {friendshipStatus.status === 'accepted' && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-4 py-2 bg-success-bg text-success-text rounded-lg border border-success-text/30">
                          Friends
                        </span>
                        <button
                          onClick={() => handleFriendAction('remove')}
                          disabled={processing}
                          className="px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors text-sm disabled:opacity-50 border border-error-text/30"
                        >
                          {processing ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                      {friendshipStatus.friendship_id && (
                        <p className="text-xs text-text-metadata">
                          Friends since {friendshipStatus.friends_since ? new Date(friendshipStatus.friends_since).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'recently'}
                        </p>
                      )}
                    </div>
                  )}
                  {friendshipStatus.status === 'blocked' && (
                    <button
                      onClick={() => handleFriendAction('unblock')}
                      disabled={processing}
                      className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors disabled:opacity-50"
                    >
                      {processing ? 'Unblocking...' : 'Unblock'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-4 gap-4 border-t border-border-medium pt-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-primary">{userData.stats?.collections || 0}</div>
              <div className="text-sm text-text-metadata">Collections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-primary">{userData.stats?.saved_adages || 0}</div>
              <div className="text-sm text-text-metadata">Saved Adages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-primary">{userData.stats?.comments || 0}</div>
              <div className="text-sm text-text-metadata">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-primary">{userData.stats?.friends || 0}</div>
              <div className="text-sm text-text-metadata">Friends</div>
            </div>
          </div>

          {/* Public Collections */}
          <div className="border-t border-border-medium pt-6 mt-6">
            <h2 className="text-xl font-bold font-serif text-text-primary mb-4">Public Collections</h2>
            {userData.public_collections && userData.public_collections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData.public_collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/profile/collections/${collection.id}`}
                    className="bg-card-bg-muted p-4 rounded-lg border border-border-medium hover:border-accent-primary hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-text-primary mb-2">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-sm text-text-secondary line-clamp-2 mb-2">{collection.description}</p>
                    )}
                    <p className="text-xs text-text-metadata">
                      Created {new Date(collection.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No public collections yet.</p>
            )}
          </div>

          {/* Featured Comments - Only show if profile is not private or user is friend/self */}
          {userData.featured_comments && userData.featured_comments.length > 0 && 
           (!userData.profile_private || isOwnProfile || friendshipStatus?.status === 'accepted') && (
            <div className="border-t border-border-medium pt-6 mt-6">
              <h2 className="text-xl font-bold font-serif text-text-primary mb-4">Featured Comments</h2>
              <div className="space-y-4">
                {userData.featured_comments.map((comment: any) => {
                  let link = '#'
                  let title = ''

                  if (comment.target_type === 'adage' && comment.adage) {
                    link = `/archive/${comment.adage.id}`
                    title = `"${comment.adage.adage}"`
                  } else if (comment.target_type === 'blog' && comment.blog_post) {
                    link = `/blog/${comment.blog_post.slug || comment.blog_post.id}`
                    title = comment.blog_post.title
                  }

                  return (
                    <div key={comment.id} className="bg-accent-primary/5 p-4 rounded-lg border-2 border-accent-primary/30">
                      <div className="flex justify-between items-start mb-2">
                        <Link
                          href={link}
                          className="text-accent-primary hover:underline font-semibold"
                        >
                          {title}
                        </Link>
                        <span className="text-xs text-text-metadata">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {comment.user && (
                        <div className="flex items-center gap-2 mb-2">
                          {comment.user.profile_image_url ? (
                            <img
                              src={comment.user.profile_image_url}
                              alt={comment.user.display_name || comment.user.username || 'User'}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center text-text-inverse text-xs">
                              {(comment.user.display_name || comment.user.username || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-text-secondary">
                            {comment.user.display_name || comment.user.username || 'User'}
                          </span>
                        </div>
                      )}
                      <p className="text-text-secondary">{comment.content}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="border-t border-border-medium pt-6 mt-6">
            <h2 className="text-xl font-bold font-serif text-text-primary mb-4">Recent Comments</h2>
            {userData.recent_comments && userData.recent_comments.length > 0 ? (
              <div className="space-y-4">
                {userData.recent_comments.map((comment) => {
                  let link = '#'
                  let title = ''

                  if (comment.target_type === 'adage' && comment.adage) {
                    link = `/archive/${comment.adage.id}`
                    title = `"${comment.adage.adage}"`
                  } else if (comment.target_type === 'blog' && comment.blog_post) {
                    link = `/blog/${comment.blog_post.slug || comment.blog_post.id}`
                    title = comment.blog_post.title
                  }

                  return (
                    <div key={comment.id} className="bg-card-bg-muted p-4 rounded-lg border border-border-medium">
                      <div className="flex justify-between items-start mb-2">
                        <Link
                          href={link}
                          className="text-accent-primary hover:underline font-semibold"
                        >
                          {title}
                        </Link>
                        <span className="text-xs text-text-metadata">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-2">{comment.content}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-text-secondary">No recent comments to display.</p>
            )}
          </div>

          {/* Profile Comments Section */}
          {(!userData.profile_private || isOwnProfile || friendshipStatus?.status === 'accepted') && (
            <div className="border-t border-border-medium pt-6 mt-6">
              <h2 className="text-xl font-bold font-serif text-text-primary mb-4">Comments</h2>
              <CommentsSection targetType="user" targetId={userId} />
            </div>
          )}
          {userData.profile_private && !isOwnProfile && friendshipStatus?.status !== 'accepted' && (
            <div className="border-t border-border-medium pt-6 mt-6">
              <p className="text-text-secondary italic">This user has a private profile. Comments are only visible to friends.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PublicProfile() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
      </div>
    }>
      <PublicProfileContent />
    </Suspense>
  )
}

