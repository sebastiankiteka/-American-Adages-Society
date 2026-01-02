'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getLeadership, saveLeadership, addLeadershipMember, updateLeadershipMember, deleteLeadershipMember, type LeadershipMember } from '@/lib/adminData'

export default function AdminLeadership() {
  const [authenticated, setAuthenticated] = useState(false)
  const [leadership, setLeadership] = useState<LeadershipMember[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<LeadershipMember>>({})
  const router = useRouter()

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuth) {
      router.push('/admin/login')
    } else {
      setAuthenticated(true)
      setLeadership(getLeadership())
    }
  }, [router])

  const handleSave = () => {
    if (editing !== null) {
      updateLeadershipMember(editing, formData)
    } else {
      const newMember: LeadershipMember = {
        name: formData.name || '',
        role: formData.role || '',
        bio: formData.bio || '',
        image: formData.image,
      }
      addLeadershipMember(newMember)
    }
    setLeadership(getLeadership())
    setEditing(null)
    setShowAddForm(false)
    setFormData({})
  }

  const handleEdit = (index: number, member: LeadershipMember) => {
    setEditing(index)
    setFormData(member)
    setShowAddForm(true)
  }

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this leadership member?')) {
      deleteLeadershipMember(index)
      setLeadership(getLeadership())
    }
  }

  if (!authenticated) return null

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-charcoal">Manage Leadership</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
            >
              Back to Admin
            </button>
            <button
              onClick={() => {
                setShowAddForm(true)
                setEditing(null)
                setFormData({})
              }}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
            >
              Add New Member
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray mb-8">
            <h2 className="text-2xl font-bold font-serif mb-6 text-charcoal">
              {editing !== null ? 'Edit Leadership Member' : 'Add New Leadership Member'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Role *</label>
                <input
                  type="text"
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  placeholder="President, Vice President, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Bio *</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Image URL (optional)</label>
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  placeholder="/path/to/image.jpg"
                />
                <p className="text-xs text-charcoal-light mt-1">
                  Upload images to the public folder and reference them here (e.g., /leadership/president.jpg)
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(null)
                    setShowAddForm(false)
                    setFormData({})
                  }}
                  className="px-6 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leadership.map((member, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-serif mb-2 text-charcoal">{member.name}</h3>
                  <p className="text-bronze font-semibold mb-3">{member.role}</p>
                  <p className="text-charcoal-light">{member.bio}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(index, member)}
                    className="px-3 py-1 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

