'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Document {
  id: string
  title: string
  description?: string
  file_url: string
  file_name: string
  category: string
  created_at: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

const categoryLabels: Record<string, string> = {
  constitution: 'Constitution',
  bylaws: 'Bylaws',
  financial: 'Financial',
  'meeting-minutes': 'Meeting Minutes',
  policies: 'Policies',
  general: 'General',
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        const url = selectedCategory === 'all' 
          ? '/api/documents' 
          : `/api/documents?category=${selectedCategory}`
        const response = await fetch(url)
        const result: ApiResponse<Document[]> = await response.json()
        
        if (result.success && result.data) {
          setDocuments(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch documents:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [selectedCategory])

  const categories = ['all', 'constitution', 'bylaws', 'financial', 'meeting-minutes', 'policies', 'general']
  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = []
    }
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/transparency"
            className="text-accent-primary hover:underline mb-4 inline-block"
          >
            ← Back to Transparency
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            Documents
          </h1>
          <p className="text-lg text-text-primary">
            Access all organizational documents, including constitution, bylaws, financial reports, and meeting minutes.
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-card-bg p-4 rounded-lg shadow-sm border border-border-medium mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === cat
                    ? 'bg-accent-primary text-text-inverse'
                    : 'bg-card-bg-muted text-text-primary hover:bg-text-primary hover:text-text-inverse'
                }`}
              >
                {cat === 'all' ? 'All' : categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-metadata">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium text-center">
            <p className="text-text-primary">No documents found in this category.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedCategory === 'all' ? (
              // Grouped by category
              Object.entries(groupedDocuments).map(([category, docs]) => (
                <div key={category} className="bg-card-bg rounded-lg shadow-sm border border-border-medium overflow-hidden">
                  <div className="bg-card-bg-muted px-6 py-3 border-b border-border-medium">
                    <h2 className="text-xl font-bold font-serif text-text-primary">
                      {categoryLabels[category] || category}
                    </h2>
                  </div>
                  <div className="divide-y divide-border-medium">
                    {docs.map((doc) => (
                      <div key={doc.id} className="p-6 hover:bg-card-bg-muted transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-text-primary mb-2">
                              {doc.title}
                            </h3>
                            {doc.description && (
                              <p className="text-sm text-text-primary mb-3">
                                {doc.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-text-metadata">
                              <span>{doc.file_name}</span>
                              <span>•</span>
                              <span>{format(new Date(doc.created_at), 'MMMM d, yyyy')}</span>
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col items-end gap-2">
                            <Link
                              href={`/transparency/pdf/${doc.file_url.replace(/^\//, '').replace(/\.pdf$/i, '')}`}
                              className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-sm"
                            >
                              View PDF
                            </Link>
                            <p className="text-xs text-text-metadata text-right max-w-[120px]">
                              Print page to download
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Single category view
              <div className="bg-card-bg rounded-lg shadow-sm border border-border-medium overflow-hidden">
                <div className="bg-card-bg-muted px-6 py-3 border-b border-border-medium">
                  <h2 className="text-xl font-bold font-serif text-text-primary">
                    {categoryLabels[selectedCategory] || selectedCategory}
                  </h2>
                </div>
                <div className="divide-y divide-border-medium">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-6 hover:bg-card-bg-muted transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-text-primary mb-2">
                            {doc.title}
                          </h3>
                          {doc.description && (
                            <p className="text-sm text-text-primary mb-3">
                              {doc.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-text-metadata">
                            <span>{doc.file_name}</span>
                            <span>•</span>
                            <span>{format(new Date(doc.created_at), 'MMMM d, yyyy')}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <Link
                            href={`/transparency/pdf/${doc.file_url.replace(/^\//, '').replace(/\.pdf$/i, '')}`}
                            className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
                          >
                            View PDF
                          </Link>
                          <p className="text-xs text-charcoal-light text-right max-w-[120px]">
                            Print page to download
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

