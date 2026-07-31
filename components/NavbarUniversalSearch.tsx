'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Package,
  Wrench,
  Award,
  Layers,
  BookOpen,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react'

interface UniversalSearchItem {
  id: string
  title: string
  subtitle: string
  url: string
  type: 'Product' | 'Spare Part' | 'Brand' | 'Category' | 'Catalogue'
  badge?: string
  image?: string
  searchableText?: string
}

interface NavbarUniversalSearchProps {
  onNavigate?: () => void
}

export default function NavbarUniversalSearch({ onNavigate }: NavbarUniversalSearchProps = {}) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<UniversalSearchItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch universal index on mount or first focus for 0ms instantaneous stroke filtering
  const loadIndex = async (forceRetry = false) => {
    if (loaded && !forceRetry) return
    try {
      const res = await fetch('/api/universal-search', {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        setItems(data)
        setLoaded(true)
      }
    } catch (err) {
      console.error('Failed to load universal search index', err)
    }
  }

  useEffect(() => {
    loadIndex()
  }, [])

  // If user starts typing and items are empty (e.g. initial fetch failed), automatically retry
  useEffect(() => {
    if (query.trim().length >= 1 && items.length === 0) {
      loadIndex(true)
    }
  }, [query, items.length])

  // Handle outside click to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Instantaneous multi-token stroke filtering in memory across all fields & specifications
  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return []
    const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return []

    return items
      .filter((item) => {
        const fullText = [
          item.title,
          item.subtitle,
          item.badge || '',
          item.type,
          item.searchableText || '',
        ]
          .join(' ')
          .toLowerCase()

        return tokens.every((token) => fullText.includes(token))
      })
      .slice(0, 12) // Show top 12 matches across inventory
  }, [query, items])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = (url: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(url)
    onNavigate?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (
        query.trim().length >= 2 &&
        results.length > 0 &&
        selectedIndex >= 0 &&
        selectedIndex < results.length
      ) {
        handleSelect(results[selectedIndex].url)
      } else if (query.trim().length >= 2) {
        handleSelect(`/products?q=${encodeURIComponent(query.trim())}`)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const getItemIcon = (type: UniversalSearchItem['type']) => {
    switch (type) {
      case 'Product':
        return <Package className="w-4 h-4 text-red-600" />
      case 'Spare Part':
        return <Wrench className="w-4 h-4 text-rose-600" />
      case 'Brand':
        return <Award className="w-4 h-4 text-blue-600" />
      case 'Category':
        return <Layers className="w-4 h-4 text-sky-600" />
      case 'Catalogue':
        return <BookOpen className="w-4 h-4 text-emerald-600" />
      default:
        return <Search className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar */}
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search over 10,000+ power tools, spare armatures, brands, or catalogues..."
          value={query}
          onFocus={() => {
            loadIndex()
            if (query.trim()) setIsOpen(true)
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-slate-100/95 hover:bg-slate-100 focus:bg-white border-2 border-slate-200/80 focus:border-red-600 rounded-2xl py-2.5 sm:py-3 pl-11 pr-24 text-sm sm:text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-4 focus:ring-red-600/15 transition shadow-inner"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

        {!query && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-extrabold text-slate-500 pointer-events-none shadow-xs">
            <Sparkles className="w-3 h-3 text-red-600" />
            <span>INSTANT</span>
          </div>
        )}

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md bg-white border border-slate-200 shadow-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Instant Dropdown Popover */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute right-0 left-0 top-full mt-2 bg-white/95 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 max-h-[80vh] overflow-y-auto">
          {/* Popover Header */}
          <div className="px-3.5 py-2 bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            <span>Instant Universal Catalog Search</span>
            {query.trim().length >= 2 && (
              <span className="text-red-600 font-black">
                {results.length} matched across catalog
              </span>
            )}
          </div>

          {query.trim().length === 1 ? (
            <div className="p-6 text-center space-y-1.5 bg-gradient-to-b from-white to-blue-50/40">
              <Search className="w-6 h-6 text-red-600 mx-auto animate-pulse" />
              <div className="text-xs font-extrabold text-slate-800">
                Keep typing to search instantly...
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Enter at least 2 characters to search across products, genuine spares, brands, specifications, and catalogues.
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center space-y-2 bg-gradient-to-b from-white to-blue-50/30">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-extrabold text-slate-700">
                No instant matches found for &ldquo;{query}&rdquo;
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSelect(`/products?q=${encodeURIComponent(query.trim())}`)
                }
                className="inline-flex items-center gap-1 text-xs font-black text-red-600 hover:text-red-700 pt-1 cursor-pointer"
              >
                <span>Search entire inventory catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="p-1.5 space-y-1 max-h-[65vh] overflow-y-auto">
                {results.map((item, idx) => {
                  const isHighlighted = idx === selectedIndex
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.url)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-3 group cursor-pointer ${
                        isHighlighted
                          ? 'bg-red-50 text-slate-950 border border-red-200 shadow-xs'
                          : 'hover:bg-blue-50/60 text-slate-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isHighlighted
                              ? 'bg-red-100/80'
                              : 'bg-slate-100 group-hover:bg-red-100/50'
                          }`}
                        >
                          {getItemIcon(item.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-slate-900 truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-500 truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {item.type}
                        </span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 ${
                            isHighlighted ? 'text-red-600 opacity-100' : 'opacity-0'
                          } transition`}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* View All Search Link Footer */}
              <button
                type="button"
                onClick={() =>
                  handleSelect(`/products?q=${encodeURIComponent(query.trim())}`)
                }
                className="w-full px-4 py-2.5 bg-slate-900 hover:bg-red-700 text-white text-xs font-extrabold flex items-center justify-between transition group cursor-pointer"
              >
                <span>
                  See all inventory results for &ldquo;{query}&rdquo;
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 transition" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

