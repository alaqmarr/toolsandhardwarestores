'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle,
  FileDown,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Loader2,
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

export default function ResourcesClient() {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

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

  const categoriesList = [
    'ALL',
    'Power Tools',
    'Heavy Machinery',
    'Spare Parts',
    'Safety Manuals',
  ]

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-red-500/20 px-3.5 py-1 rounded-full border border-red-500/30 text-red-300 font-extrabold text-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official Technical Hub & Downloads</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.1]">
            Industrial Catalogues & Technical Brochures
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Download comprehensive manufacturer master catalogues, spare parts fitment diagrams, and
            heavy machinery manuals. Updated for 2026 industrial procurement.
          </p>
        </div>
      </div>

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

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Catalogues' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalogues Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">
            Loading technical catalogues...
          </p>
        </div>
      ) : filteredCatalogues.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 space-y-4">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">
            No catalogues found
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or upload a new catalogue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalogues.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-red-400 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                    <FileDown className="w-7 h-7 text-rose-600" />
                  </div>
                  <span className="bg-slate-100 text-slate-700 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-red-600 transition line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {item.description ||
                      'Official technical specification sheet and industrial tool brochure.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <span className="font-bold text-slate-900">
                    {item.fileType || 'PDF'}
                  </span>
                  <span>•</span>
                  <span>{item.fileSize || '10 MB'}</span>
                </div>

                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
