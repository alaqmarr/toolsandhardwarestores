'use client'

import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Upload,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  FileText,
  X,
  Search,
  CheckCircle,
} from 'lucide-react'

interface Catalogue {
  id: string
  title: string
  category: string
  description?: string
  fileUrl: string
  fileSize?: string
  fileType?: string
  createdAt?: string
}

export default function CataloguesAdminClient() {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  // Upload modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Power Tools')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchCatalogues()
  }, [])

  const fetchCatalogues = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/resources')
      if (res.ok) {
        const data = await res.json()
        setCatalogues(data)
      }
    } catch (err) {
      console.error('Failed to fetch catalogues', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !file) {
      setErrorMsg('Please provide a title and select a catalogue file.')
      return
    }

    try {
      setUploading(true)
      setErrorMsg('')
      const formData = new FormData()
      formData.append('title', title)
      formData.append('category', category)
      formData.append('description', description)
      formData.append('file', file)

      const res = await fetch('/api/resources', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setIsModalOpen(false)
        setTitle('')
        setDescription('')
        setFile(null)
        setSuccessMsg('Catalogue uploaded successfully!')
        setTimeout(() => setSuccessMsg(''), 4000)
        await fetchCatalogues()
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Upload failed')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, catalogueTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${catalogueTitle}"?`)) return
    try {
      const res = await fetch(`/api/resources?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSuccessMsg('Catalogue deleted successfully!')
        setTimeout(() => setSuccessMsg(''), 4000)
        await fetchCatalogues()
      } else {
        alert('Failed to delete catalogue')
      }
    } catch (err) {
      console.error('Failed to delete catalogue', err)
      alert('Failed to delete catalogue')
    }
  }

  const filteredCatalogues = catalogues.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory
    return matchesQuery && matchesCategory
  })

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Catalogues & Brochures Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Upload manufacturer master catalogues and technical data sheets for public download on the Resources page.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black px-5 py-3 rounded-2xl shadow-lg transition flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 font-bold" />
          <span>Upload Catalogue</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 text-sm font-bold p-4 rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search catalogues by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-red-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'Power Tools', 'Heavy Machinery', 'Spare Parts', 'Safety Manuals'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalogues Table / Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredCatalogues.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-lg text-slate-700">No catalogues found</p>
          <p className="text-xs text-slate-500">
            Click &quot;Upload Catalogue&quot; to publish your first brochure or technical catalog.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">Catalogue Document</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">File Specs</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCatalogues.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {item.title}
                          </div>
                          {item.description && (
                            <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">
                      <div>{item.fileType || 'PDF'} &bull; {item.fileSize || '10 MB'}</div>
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:underline font-bold inline-flex items-center gap-1 mt-1"
                      >
                        <span>View File</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition inline-flex items-center gap-1 text-xs font-bold"
                        title="Delete catalogue"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-red-600" />
                <h3 className="text-xl font-black text-slate-900">
                  Upload New Catalogue
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 text-rose-700 text-xs font-bold p-3 rounded-xl border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Catalogue Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bosch 2026 Industrial Power Tools Brochure"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-red-500"
                >
                  <option value="Power Tools">Power Tools</option>
                  <option value="Heavy Machinery">Heavy Machinery</option>
                  <option value="Spare Parts">Spare Parts</option>
                  <option value="Safety Manuals">Safety Manuals</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of models or specs covered..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Catalogue File (PDF / DOCX) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-6 py-2.5 rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload Catalogue</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
