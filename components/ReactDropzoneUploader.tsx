'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReactDropzoneUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  label?: string
}

export default function ReactDropzoneUploader({
  value = [],
  onChange,
  multiple = true,
  label = 'Drag & drop images here, or click to browse',
}: ReactDropzoneUploaderProps) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setUploading(true)
      const toastId = toast.loading('Uploading files...')
      const uploadedUrls: string[] = []

      try {
        for (const file of acceptedFiles) {
          const formData = new FormData()
          formData.append('file', file)

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          const data = await res.json()
          if (!res.ok) {
            throw new Error(data.error || 'Upload failed')
          }

          uploadedUrls.push(data.url)
        }

        if (multiple) {
          onChange([...value, ...uploadedUrls])
        } else {
          onChange([uploadedUrls[0]])
        }

        toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`, {
          id: toastId,
        })
      } catch (error: any) {
        toast.error(error.message || 'Error uploading file', { id: toastId })
      } finally {
        setUploading(false)
      }
    },
    [value, onChange, multiple]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg'],
    },
    multiple,
  })

  const removeImage = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <div className="space-y-4">
      {/* Dropzone Container */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
          isDragActive
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-white/15 hover:border-amber-500/50 bg-[#161a22]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          {uploading ? (
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-amber-400" />
            </div>
          )}
          <div className="text-sm font-semibold text-white">
            {isDragActive
              ? 'Drop the files here ...'
              : label}
          </div>
          <p className="text-xs text-slate-400">
            Supports JPEG, PNG, WEBP, SVG • Uploads to Cloudflare R2 (or local fallback)
          </p>
        </div>
      </div>

      {/* Thumbnails Grid */}
      {value && value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-xl overflow-hidden bg-[#12151b] border border-white/10"
            >
              <img
                src={url}
                alt={`Uploaded ${index}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-rose-600/90 hover:bg-rose-600 text-white p-1 rounded-lg shadow-lg opacity-80 group-hover:opacity-100 transition"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-slate-300 px-2 py-0.5 truncate font-mono">
                {url.split('/').pop()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
