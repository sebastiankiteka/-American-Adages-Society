'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function PDFViewer() {
  const params = useParams()
  const router = useRouter()
  const filename = params.filename as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const displayName = filename ? filename.replace(/_/g, ' ').replace(/.pdf$/i, '') : 'PDF Document'

  useEffect(() => {
    // Verify the PDF exists
    const checkPDF = async () => {
      try {
        const pdfPath = `/${filename}.pdf`
        const response = await fetch(pdfPath, { method: 'HEAD' })
        if (!response.ok) {
          setError('PDF file not found')
        }
      } catch (err) {
        setError('Failed to load PDF')
      } finally {
        setLoading(false)
      }
    }

    if (filename) {
      checkPDF()
    }
  }, [filename])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading PDF...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-error-bg border border-error-text/30 text-error-text px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
          <Link
            href="/transparency"
            className="text-accent-primary hover:underline"
          >
            ← Back to Transparency
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold font-serif text-text-primary mb-2">
                {displayName}
              </h1>
              <p className="text-sm text-text-primary">
                To download this PDF, use your browser's print function (Ctrl+P or Cmd+P) and select "Save as PDF"
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
              >
                Print / Save PDF
              </button>
              <Link
                href="/transparency"
                className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-bg-secondary transition-colors"
              >
                Back
              </Link>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="bg-card-bg rounded-lg shadow-sm border border-border-medium overflow-hidden">
          <iframe
            src={`/${filename}.pdf`}
            className="w-full h-[calc(100vh-300px)] min-h-[600px]"
            title="PDF Viewer"
          />
        </div>

        {/* Instructions */}
        <div className="bg-card-bg p-4 rounded-lg border border-border-medium mt-6">
          <p className="text-sm text-text-primary">
            <strong className="text-text-primary">Tip:</strong> To download this PDF, click the "Print / Save PDF" button above, 
            or use your browser's print function (Ctrl+P or Cmd+P) and select "Save as PDF" as the destination.
          </p>
        </div>
      </div>
    </div>
  )
}

