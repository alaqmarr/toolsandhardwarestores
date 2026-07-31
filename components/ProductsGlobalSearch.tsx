'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Sparkles } from 'lucide-react'

export default function ProductsGlobalSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentQ = searchParams.get('q') || ''
  const [query, setQuery] = useState(currentQ)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/products')
    }
  }

  const handleClear = () => {
    setQuery('')
    router.push('/products')
  }

  const quickTags = [
    'Bosch',
    'DeWalt',
    'Makita',
    'Hitachi',
    'Rotary Hammer',
    'Demolition Breaker',
    'Angle Grinder',
    'Cordless',
  ]

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-black tracking-tight text-white">
            Universal Tool & Machinery Search
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Search across brands, categories, features, and specifications
        </span>
      </div>

      <form onSubmit={handleSearch} className="relative flex items-center">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by model, brand (Bosch, DeWalt, Makita), category, or application..."
          className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-slate-400 text-sm font-medium rounded-2xl pl-12 pr-28 py-4 border border-white/15 focus:border-red-400 focus:outline-hidden transition"
        />
        <div className="absolute right-2 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick search tags */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-slate-400 font-bold mr-1">Quick search:</span>
        {quickTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag)
              router.push(`/products?q=${encodeURIComponent(tag)}`)
            }}
            className="bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 hover:border-red-400/50 px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
