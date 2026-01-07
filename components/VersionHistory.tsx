'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface Version {
  id: string
  version_number: number
  change_summary?: string
  changed_by?: string
  changed_by_user?: {
    username?: string
    display_name?: string
  }
  created_at: string
  [key: string]: any
}

interface VersionHistoryProps {
  targetType: 'adage' | 'blog'
  targetId: string
}

export default function VersionHistory({ targetType, targetId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true)
        const endpoint = targetType === 'adage'
          ? `/api/adages/${targetId}/versions`
          : `/api/blog-posts/${targetId}/versions`
        
        const response = await fetch(endpoint)
        const result = await response.json()
        
        if (result.success && result.data) {
          setVersions(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch version history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVersions()
  }, [targetType, targetId])

  if (loading) {
    return <div className="text-sm text-charcoal-light">Loading version history...</div>
  }

  if (versions.length === 0) {
    return (
      <div className="text-sm text-charcoal-light italic">
        No version history available
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-charcoal mb-4">Version History</h3>
      {versions.map((version) => (
        <div
          key={version.id}
          className="bg-cream p-4 rounded-lg border border-soft-gray"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-charcoal">
                  Version {version.version_number}
                </span>
                <span className="text-xs text-charcoal-light">
                  {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              {version.changed_by_user && (
                <p className="text-sm text-charcoal-light mb-2">
                  Changed by: {version.changed_by_user.display_name || version.changed_by_user.username || 'Unknown'}
                </p>
              )}
              {version.change_summary && (
                <p className="text-sm text-charcoal-light mb-2">
                  {version.change_summary}
                </p>
              )}
            </div>
            <button
              onClick={() => setExpandedVersion(
                expandedVersion === version.id ? null : version.id
              )}
              className="text-sm text-bronze hover:underline"
            >
              {expandedVersion === version.id ? 'Hide' : 'View'}
            </button>
          </div>
          {expandedVersion === version.id && (
            <div className="mt-4 pt-4 border-t border-soft-gray">
              {targetType === 'adage' ? (
                <div className="space-y-2 text-sm">
                  {version.adage && (
                    <div>
                      <strong>Adage:</strong> "{version.adage}"
                    </div>
                  )}
                  {version.definition && (
                    <div>
                      <strong>Definition:</strong> {version.definition}
                    </div>
                  )}
                  {version.origin && (
                    <div>
                      <strong>Origin:</strong> {version.origin}
                    </div>
                  )}
                  {version.change_summary && (
                    <div className="mt-2 text-charcoal-light italic">
                      <strong>Change Summary:</strong> {version.change_summary}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  {version.title && (
                    <div>
                      <strong>Title:</strong> {version.title}
                    </div>
                  )}
                  {version.excerpt && (
                    <div>
                      <strong>Excerpt:</strong> {version.excerpt}
                    </div>
                  )}
                  {version.change_summary && (
                    <div className="mt-2 text-charcoal-light italic">
                      <strong>Change Summary:</strong> {version.change_summary}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

