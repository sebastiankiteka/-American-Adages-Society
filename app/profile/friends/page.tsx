'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
  direction: 'outgoing' | 'incoming'
  other_user: {
    id: string
    username?: string
    display_name?: string
    profile_image_url?: string
    role: string
  }
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function FriendsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'accepted' | 'pending' | 'blocked'>('all')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    fetchFriendships()
  }, [session, status, router, activeTab])

  const fetchFriendships = async () => {
    try {
      setLoading(true)
      const statusParam = activeTab === 'all' ? 'all' : activeTab
      const response = await fetch(`/api/friends?status=${statusParam}`)
      const result: ApiResponse<Friendship[]> = await response.json()

      if (result.success && result.data) {
        setFriendships(result.data)
      } else {
        console.error('Failed to fetch friends:', result.error)
      }
    } catch (err) {
      console.error('Failed to fetch friends:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (friendshipId: string, userId: string, action: 'accept' | 'reject' | 'block' | 'unblock' | 'remove') => {
    if (processing) return

    setProcessing(friendshipId)
    try {
      if (action === 'remove') {
        const response = await fetch(`/api/friends/${userId}`, {
          method: 'DELETE',
        })
        const result: ApiResponse = await response.json()
        if (result.success) {
          fetchFriendships()
        } else {
          alert(result.error || 'Failed to remove friend')
        }
      } else {
        const response = await fetch(`/api/friends/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        })
        const result: ApiResponse = await response.json()
        if (result.success) {
          fetchFriendships()
        } else {
          alert(result.error || `Failed to ${action} friend request`)
        }
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred')
    } finally {
      setProcessing(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  const acceptedFriends = friendships.filter(f => f.status === 'accepted')
  const pendingOutgoing = friendships.filter(f => f.status === 'pending' && f.direction === 'outgoing')
  const pendingIncoming = friendships.filter(f => f.status === 'pending' && f.direction === 'incoming')
  const blocked = friendships.filter(f => f.status === 'blocked')

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-text-primary">Friends</h1>
          <Link
            href="/profile"
            className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg hover:text-text-inverse transition-colors"
          >
            Back to Profile
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'all'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-metadata hover:text-text-primary'
            }`}
          >
            All ({friendships.length})
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'accepted'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-metadata hover:text-text-primary'
            }`}
          >
            Friends ({acceptedFriends.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'pending'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-metadata hover:text-text-primary'
            }`}
          >
            Pending ({pendingIncoming.length + pendingOutgoing.length})
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'blocked'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-metadata hover:text-text-primary'
            }`}
          >
            Blocked ({blocked.length})
          </button>
        </div>

        {/* Friends List */}
        <div className="space-y-4">
          {activeTab === 'all' && friendships.length === 0 && (
            <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
              <p className="text-text-secondary mb-4">You don't have any friends yet.</p>
              <Link
                href="/archive"
                className="text-accent-primary hover:underline"
              >
                Browse users to add friends
              </Link>
            </div>
          )}

          {activeTab === 'accepted' && acceptedFriends.length === 0 && (
            <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
              <p className="text-text-secondary">No friends yet.</p>
            </div>
          )}

          {activeTab === 'pending' && pendingIncoming.length === 0 && pendingOutgoing.length === 0 && (
            <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
              <p className="text-text-secondary">No pending friend requests.</p>
            </div>
          )}

          {activeTab === 'blocked' && blocked.length === 0 && (
            <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
              <p className="text-text-secondary">No blocked users.</p>
            </div>
          )}

          {/* Accepted Friends */}
          {(activeTab === 'all' || activeTab === 'accepted') && acceptedFriends.map((friendship) => (
            <div key={friendship.id} className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {friendship.other_user.profile_image_url ? (
                    <img
                      src={friendship.other_user.profile_image_url}
                      alt={friendship.other_user.display_name || friendship.other_user.username || 'User'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-accent-primary text-text-inverse flex items-center justify-center text-2xl font-bold">
                      {(friendship.other_user.display_name || friendship.other_user.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/profile/${friendship.other_user.id}`}
                      className="text-lg font-semibold text-text-primary hover:text-accent-primary"
                    >
                      {friendship.other_user.display_name || friendship.other_user.username || 'User'}
                    </Link>
                    {friendship.other_user.username && (
                      <p className="text-sm text-text-metadata">@{friendship.other_user.username}</p>
                    )}
                    <p className="text-xs text-text-metadata">
                      Friends since {new Date(friendship.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAction(friendship.id, friendship.other_user.id, 'remove')}
                  disabled={processing === friendship.id}
                  className="px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors text-sm disabled:opacity-50 border border-error-text/30"
                >
                  {processing === friendship.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}

          {/* Pending Incoming Requests */}
          {(activeTab === 'all' || activeTab === 'pending') && pendingIncoming.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold font-serif text-text-primary mb-4">Incoming Requests</h2>
              {pendingIncoming.map((friendship) => (
                <div key={friendship.id} className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {friendship.other_user.profile_image_url ? (
                        <img
                          src={friendship.other_user.profile_image_url}
                          alt={friendship.other_user.display_name || friendship.other_user.username || 'User'}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-accent-primary text-text-inverse flex items-center justify-center text-2xl font-bold">
                          {(friendship.other_user.display_name || friendship.other_user.username || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/profile/${friendship.other_user.id}`}
                          className="text-lg font-semibold text-text-primary hover:text-accent-primary"
                        >
                          {friendship.other_user.display_name || friendship.other_user.username || 'User'}
                        </Link>
                        {friendship.other_user.username && (
                          <p className="text-sm text-text-metadata">@{friendship.other_user.username}</p>
                        )}
                        <p className="text-xs text-text-metadata">
                          Sent {new Date(friendship.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(friendship.id, friendship.other_user.id, 'accept')}
                        disabled={processing === friendship.id}
                        className="px-4 py-2 bg-success-bg text-success-text rounded-lg hover:bg-success-text/20 transition-colors text-sm disabled:opacity-50 border border-success-text/30"
                      >
                        {processing === friendship.id ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleAction(friendship.id, friendship.other_user.id, 'reject')}
                        disabled={processing === friendship.id}
                        className="px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors text-sm disabled:opacity-50 border border-error-text/30"
                      >
                        {processing === friendship.id ? 'Rejecting...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleAction(friendship.id, friendship.other_user.id, 'block')}
                        disabled={processing === friendship.id}
                        className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors text-sm disabled:opacity-50"
                      >
                        {processing === friendship.id ? 'Blocking...' : 'Block'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending Outgoing Requests */}
          {(activeTab === 'all' || activeTab === 'pending') && pendingOutgoing.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold font-serif text-text-primary mb-4">Outgoing Requests</h2>
              {pendingOutgoing.map((friendship) => (
                <div key={friendship.id} className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {friendship.other_user.profile_image_url ? (
                        <img
                          src={friendship.other_user.profile_image_url}
                          alt={friendship.other_user.display_name || friendship.other_user.username || 'User'}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-accent-primary text-text-inverse flex items-center justify-center text-2xl font-bold">
                          {(friendship.other_user.display_name || friendship.other_user.username || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/profile/${friendship.other_user.id}`}
                          className="text-lg font-semibold text-text-primary hover:text-accent-primary"
                        >
                          {friendship.other_user.display_name || friendship.other_user.username || 'User'}
                        </Link>
                        {friendship.other_user.username && (
                          <p className="text-sm text-text-metadata">@{friendship.other_user.username}</p>
                        )}
                        <p className="text-xs text-text-metadata">
                          Sent {new Date(friendship.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-warning-bg text-warning-text rounded-lg text-sm border border-warning-text/30">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Blocked Users */}
          {(activeTab === 'all' || activeTab === 'blocked') && blocked.map((friendship) => (
            <div key={friendship.id} className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {friendship.other_user.profile_image_url ? (
                    <img
                      src={friendship.other_user.profile_image_url}
                      alt={friendship.other_user.display_name || friendship.other_user.username || 'User'}
                      className="w-16 h-16 rounded-full object-cover opacity-50"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-400 text-white flex items-center justify-center text-2xl font-bold opacity-50">
                      {(friendship.other_user.display_name || friendship.other_user.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-text-primary-light">
                      {friendship.other_user.display_name || friendship.other_user.username || 'User'}
                    </p>
                    {friendship.other_user.username && (
                      <p className="text-sm text-text-metadata">@{friendship.other_user.username}</p>
                    )}
                    <p className="text-xs text-text-metadata">
                      Blocked {new Date(friendship.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAction(friendship.id, friendship.other_user.id, 'unblock')}
                  disabled={processing === friendship.id}
                  className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors text-sm disabled:opacity-50"
                >
                  {processing === friendship.id ? 'Unblocking...' : 'Unblock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

