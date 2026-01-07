'use client'

import { useState, useRef, useEffect } from 'react'

interface ImageUploadProps {
  currentImageUrl?: string
  onImageChange: (imageUrl: string) => void
  onCancel: () => void
}

export default function ImageUpload({ currentImageUrl, onImageChange, onCancel }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setPreview(imageUrl)
        // Reset crop area to center
        setTimeout(() => {
          if (containerRef.current) {
            const size = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight) * 0.6
            const x = (containerRef.current.clientWidth - size) / 2
            const y = (containerRef.current.clientHeight - size) / 2
            setCropArea({ x, y, width: size, height: size })
          }
        }, 100)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!containerRef.current || !preview) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Check if click is within crop area
    if (
      x >= cropArea.x && x <= cropArea.x + cropArea.width &&
      y >= cropArea.y && y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true)
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || !preview) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(e.clientX - rect.left - dragStart.x, rect.width - cropArea.width))
      const y = Math.max(0, Math.min(e.clientY - rect.top - dragStart.y, rect.height - cropArea.height))
      setCropArea(prev => ({ ...prev, x, y }))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, cropArea.width, cropArea.height, preview])

  const handleCrop = () => {
    if (!preview || !imageRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.onload = () => {
      // Calculate scale
      const scale = Math.min(
        (containerRef.current?.clientWidth || 400) / img.width,
        (containerRef.current?.clientHeight || 400) / img.height
      )
      
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const scaledX = cropArea.x / scale
      const scaledY = cropArea.y / scale
      const scaledCropWidth = cropArea.width / scale
      const scaledCropHeight = cropArea.height / scale

      canvas.width = 200
      canvas.height = 200
      
      ctx.drawImage(
        img,
        scaledX, scaledY, scaledCropWidth, scaledCropHeight,
        0, 0, 200, 200
      )

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
      onImageChange(croppedDataUrl)
    }
    img.src = preview
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-charcoal mb-2">
            Upload Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
          />
        </div>
        {preview && (
          <div className="flex gap-2">
            <button
              onClick={handleCrop}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
            >
              Crop & Use
            </button>
            <button
              onClick={() => {
                setPreview(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {preview && (
        <div className="relative">
          <div
            ref={containerRef}
            className="relative w-full max-w-md h-96 bg-soft-gray rounded-lg overflow-hidden border-2 border-bronze"
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
          >
            <img
              ref={imageRef}
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
              onLoad={() => {
                // Center crop area when image loads
                if (containerRef.current) {
                  const size = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight) * 0.6
                  const x = (containerRef.current.clientWidth - size) / 2
                  const y = (containerRef.current.clientHeight - size) / 2
                  setCropArea({ x, y, width: size, height: size })
                }
              }}
            />
            {/* Crop overlay */}
            <div
              className="absolute border-2 border-bronze bg-bronze/10"
              style={{
                left: `${cropArea.x}px`,
                top: `${cropArea.y}px`,
                width: `${cropArea.width}px`,
                height: `${cropArea.height}px`,
                cursor: isDragging ? 'grabbing' : 'move',
              }}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-bronze/30"></div>
                ))}
              </div>
            </div>
            {/* Dark overlay outside crop area */}
            <div
              className="absolute inset-0 bg-black/60 pointer-events-none"
              style={{
                clipPath: `polygon(
                  0% 0%, 0% 100%,
                  ${cropArea.x}px 100%,
                  ${cropArea.x}px ${cropArea.y}px,
                  ${cropArea.x + cropArea.width}px ${cropArea.y}px,
                  ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,
                  ${cropArea.x}px ${cropArea.y + cropArea.height}px,
                  ${cropArea.x}px 100%,
                  100% 100%, 100% 0%
                )`,
              }}
            />
          </div>
          <p className="text-xs text-charcoal-light mt-2">
            Drag the crop box to adjust position. Click "Crop & Use" when ready.
          </p>
        </div>
      )}

      {preview && (
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

