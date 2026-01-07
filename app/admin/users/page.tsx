'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  email: string
  username?: string
  display_name?: string
  role: string
  email_verified: boolean
  created_at: string
  deleted_at?: string
  last_login_at?: string
  reports?: {
    received: number
    accepted: number
  }
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function AdminUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState('user')
  const [banReason, setBanReason] = useState('')
  const [showBanModal, setShowBanModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'loading' || !session) return

    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/users?deleted=${showDeleted}`)
        const result: ApiResponse<User[]> = await response.json()

        if (result.success && result.data) {
          setUsers(result.data)
        } else {
          setError(result.error || 'Failed to load users')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [session, status, showDeleted])

  const handleRoleChange = async (userId: string, newRole: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, ban_reason: reason }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        setEditingUser(null)
        setShowBanModal(false)
        setBanReason('')
      } else {
        alert(result.error || 'Failed to update role')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update role')
    }
  }

  const handleBanClick = (user: User) => {
    setEditingUser(user)
    setNewRole('banned')
    setBanReason('')
    setShowBanModal(true)
  }

  const handleRestoreAccount = async (userId: string) => {
    if (!confirm('Are you sure you want to restore this account?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/restore`, {
        method: 'POST',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        alert('Account restored successfully')
        setUsers(users.filter(u => u.id !== userId))
      } else {
        alert(result.error || 'Failed to restore account')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to restore account')
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
      </div>
    )
  }

  if ((session.user as any)?.role !== 'admin') {
    return null
  }

  const activeUsers = users.filter(u => !u.deleted_at)
  const deletedUsers = users.filter(u => u.deleted_at)

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-text-primary">User Management</h1>
            <p className="text-text-secondary mt-2">
              {activeUsers.length} active users, {deletedUsers.length} deleted
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`px-4 py-2 rounded-lg transition-colors border ${
                showDeleted
                  ? 'bg-accent-primary text-text-inverse border-accent-primary'
                  : 'bg-card-bg text-text-primary border-border-medium hover:border-accent-primary'
              }`}
            >
              {showDeleted ? 'Show Active' : 'Show Deleted'}
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
            >
              Back to Admin
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">Loading users...</p>
          </div>
        ) : error ? (
          <div className="bg-error-bg border border-error-text/30 text-error-text px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="bg-card-bg rounded-lg shadow-sm border border-border-medium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-card-bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Reports
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card-bg divide-y divide-border-medium">
                  {users.map((user) => (
                    <tr key={user.id} className={user.deleted_at ? 'opacity-60' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-text-primary">{user.display_name || user.username || user.email}</div>
                        <div className="text-sm text-text-secondary">{user.email}</div>
                        {user.username && (
                          <div className="text-xs text-text-metadata">@{user.username}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser?.id === user.id ? (
                          <select
                            value={newRole}
                            onChange={(e) => {
                              const role = e.target.value
                              setNewRole(role)
                              if (role === 'banned' && user.role !== 'banned') {
                                handleBanClick(user)
                              } else if (role !== user.role) {
                                handleRoleChange(user.id, role)
                              } else {
                                setEditingUser(null)
                              }
                            }}
                            onBlur={() => {
                              if (newRole !== user.role && newRole !== 'banned') {
                                handleRoleChange(user.id, newRole)
                              } else if (newRole === user.role) {
                                setEditingUser(null)
                              }
                            }}
                            className="text-sm border border-border-medium rounded px-2 py-1 bg-card-bg-muted text-text-primary focus:border-accent-primary focus:outline-none"
                            autoFocus
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                            <option value="restricted">Restricted</option>
                            <option value="probation">Probation</option>
                            <option value="banned">Banned</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-text-primary capitalize">{user.role}</span>
                            {user.role === 'admin' && <span>👑</span>}
                            {user.role === 'moderator' && <span>🛡️</span>}
                            <button
                              onClick={() => {
                                setEditingUser(user)
                                setNewRole(user.role)
                              }}
                              className="text-xs text-accent-primary hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.deleted_at ? (
                          <span className="px-2 py-1 bg-error-bg text-error-text rounded-full text-xs border border-error-text/30">
                            Deleted
                          </span>
                        ) : user.email_verified ? (
                          <span className="px-2 py-1 bg-success-bg text-success-text rounded-full text-xs border border-success-text/30">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-warning-bg text-warning-text rounded-full text-xs border border-warning-text/30">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.reports ? (
                          <div className="flex flex-col gap-1">
                            <div className="text-text-primary">
                              <span className="font-medium">{user.reports.received}</span> received
                            </div>
                            {user.reports.accepted > 0 && (
                              <div className="text-error-text">
                                <span className="font-medium">{user.reports.accepted}</span> accepted
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-text-metadata">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.deleted_at ? (
                          <button
                            onClick={() => handleRestoreAccount(user.id)}
                            className="text-accent-primary hover:underline"
                          >
                            Restore
                          </button>
                        ) : (
                          <a
                            href={`/profile/${user.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-primary hover:underline"
                          >
                            View Profile
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ban Modal */}
        {showBanModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card-bg rounded-lg p-6 max-w-md w-full mx-4 border border-border-medium">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Ban User</h2>
              <p className="text-text-secondary mb-4">
                You are about to ban <strong>{editingUser.display_name || editingUser.username || editingUser.email}</strong>. 
                Please provide a reason for this ban. The user will receive an email notification with this reason.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Ban Reason <span className="text-error-text">*</span>
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter the reason for banning this user..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowBanModal(false)
                    setEditingUser(null)
                    setBanReason('')
                    setNewRole(editingUser.role)
                  }}
                  className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (banReason.trim()) {
                      handleRoleChange(editingUser.id, 'banned', banReason.trim())
                    } else {
                      alert('Please provide a ban reason')
                    }
                  }}
                  disabled={!banReason.trim()}
                  className="px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-error-text/30"
                >
                  Confirm Ban
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

