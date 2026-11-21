'use client'

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Search, Package, ChevronRight, X, Loader2 } from 'lucide-react'
import SpareModal from './SpareModal'
import Pagination from './Pagination'

export interface SpareItem {
  id: string
  name: string
  slug: string
  description: string | null
  images: string
  priceNote: string | null
  spareCategory: {
    id: string
    name: string
    slug: string
    parent: {
      id: string
      name: string
    } | null
  } | null
  products: {
    product: {
      id: string
      name: string
      slug: string
      brand: {
        name: string
      }
    }
  }[]
}

interface SparesCatalogClientProps {
  initialSpares: SpareItem[]
  initialTotal: number
  pageSize?: number
  topCategories: any[]
  primaryPhone: string
}

export default function SparesCatalogClient({
  initialSpares,
  initialTotal,
  pageSize = 24,
  topCategories,
  primaryPhone,
}: SparesCatalogClientProps) {
  const [spares, setSpares] = useState<SpareItem[]>(initialSpares)
  const [total, setTotal] = useState<number>(initialTotal)
  const [allCount] = useState<number>(initialTotal)
  const [page, setPage] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopCatId, setSelectedTopCatId] = useState<string | null>(null)
  const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null)
  const [activeModalSpare, setActiveModalSpare] = useState<SpareItem | null>(null)
  const [loading, setLoading] = useState(false)

  const gridTopRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const didMountRef = useRef<boolean>(false)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const activeTopCategory = useMemo(() => {
    if (!selectedTopCatId) return null
    return topCategories.find((c) => c.id === selectedTopCatId) || null
  }, [selectedTopCatId, topCategories])

  const fetchSpares = useCallback(
    async (opts: {
      q: string
      topCat: string | null
      subCat: string | null
      page: number
      scrollToTop?: boolean
    }) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (opts.q.trim()) params.set('q', opts.q.trim())
        if (opts.topCat) params.set('topCat', opts.topCat)
        if (opts.subCat) params.set('subCat', opts.subCat)
        params.set('page', String(opts.page))
        params.set('limit', String(pageSize))

        const res = await fetch(`/api/catalog/spares?${params.toString()}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          setSpares(data.items || [])
          setTotal(data.total ?? 0)
          setPage(data.page ?? opts.page)
          if (opts.scrollToTop) {
            gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Failed to query spares:', err)
        }
      } finally {
        if (abortRef.current === controller) {
          setLoading(false)
        }
      }
    },
    [pageSize]
  )

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    const timer = setTimeout(() => {
      fetchSpares({
        q: searchQuery,
        topCat: selectedTopCatId,
        subCat: selectedSubCatId,
        page: 1,
      })
    }, 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const handleCategoryChange = (nextTopCat: string | null, nextSubCat: string | null) => {
    setSelectedTopCatId(nextTopCat)
    setSelectedSubCatId(nextSubCat)
    setPage(1)
    fetchSpares({
      q: searchQuery,
      topCat: nextTopCat,
      subCat: nextSubCat,
      page: 1,
    })
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    fetchSpares({
      q: searchQuery,
      topCat: selectedTopCatId,
      subCat: selectedSubCatId,
      page: nextPage,
      scrollToTop: true,
    })
  }

  return (
    <div ref={gridTopRef} className="space-y-8 scroll-mt-24">
      {/* Search Bar & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            placeholder="Search spare parts (e.g. PBT-ED-6RF, Armature, Switch, Carbon Brush)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          {loading && <Loader2 className="w-4 h-4 text-red-600 animate-spin" />}
          <span>
            <strong className="text-slate-900">{total.toLocaleString()}</strong> spares found
            {totalPages > 1 ? ` • Page ${page} of ${totalPages}` : ''}
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleCategoryChange(null, null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              !selectedTopCatId
                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
            }`}
          >
            All Spares ({allCount.toLocaleString()})
          </button>

          {topCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id, null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                selectedTopCatId === cat.id
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Subcategories (if selected top category has them) */}
        {activeTopCategory && activeTopCategory.children && activeTopCategory.children.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 pl-2 border-l-2 border-red-500">
            <span className="text-xs text-slate-500 font-semibold mr-1">Subcategory:</span>
            <button
              type="button"
              onClick={() => handleCategoryChange(selectedTopCatId, null)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                !selectedSubCatId
                  ? 'bg-red-50 text-red-900 border-red-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              All in {activeTopCategory.name}
            </button>
            {activeTopCategory.children.map((sub: any) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleCategoryChange(selectedTopCatId, sub.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                  selectedSubCatId === sub.id
                    ? 'bg-red-50 text-red-900 border-red-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spares Grid */}
      {spares.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <Package className="w-6 h-6" />
          </div>
          <div className="text-lg font-bold text-slate-900">No spare parts match your search</div>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Try searching with a broader term or check all spares.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 transition-opacity duration-150 ${
            loading ? 'opacity-60' : 'opacity-100'
          }`}
        >
          {spares.map((spare) => {
            let imageList: string[] = []
            try {
              imageList = JSON.parse(spare.images)
            } catch {
              imageList = [spare.images]
            }
            const mainImg = imageList[0]

            return (
              <div
                key={spare.id}
                onClick={() => setActiveModalSpare(spare)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-red-400 transition flex flex-col justify-between group shadow-sm hover:shadow-md cursor-pointer"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100 flex items-center justify-center p-4">
                    <img
                      src={mainImg}
                      alt={spare.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                      {spare.spareCategory?.name || 'Uncategorized'}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition line-clamp-2">
                      {spare.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {spare.description || 'Genuine replacement spare part.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-3">
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-600 font-medium">Compatible Tools:</span>
                    <span className="font-extrabold text-slate-900">
                      {spare.products.length} Models
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveModalSpare(spare)
                      }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <span>Check Fitment</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={`/spares/${spare.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        itemLabel="spare parts"
        onPageChange={handlePageChange}
      />

      {/* Interactive Modal for Spare Fitment */}
      {activeModalSpare && (
        <SpareModal
          spare={activeModalSpare}
          primaryPhone={primaryPhone}
          onClose={() => setActiveModalSpare(null)}
        />
      )}
    </div>
  )
}
