'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, SlidersHorizontal, Loader2 } from 'lucide-react'
import ProductCard from './ProductCard'
import Pagination from './Pagination'

export interface CatalogProductItem {
  id: string
  name: string
  slug: string
  description: string
  images: string
  brand: {
    id?: string
    name: string
    slug: string
    isCore?: boolean
  }
  category: {
    id?: string
    name: string
    slug: string
  }
}

interface FilterOption {
  name: string
  slug: string
}

interface ProductCatalogClientProps {
  initialItems: CatalogProductItem[]
  initialTotal: number
  pageSize?: number
  brands?: FilterOption[]
  categories?: FilterOption[]
  lockedBrandSlug?: string
  lockedCategorySlug?: string
  primaryPhone: string
  syncUrl?: boolean
}

export default function ProductCatalogClient({
  initialItems,
  initialTotal,
  pageSize = 24,
  brands = [],
  categories = [],
  lockedBrandSlug,
  lockedCategorySlug,
  primaryPhone,
  syncUrl = false,
}: ProductCatalogClientProps) {
  const [items, setItems] = useState<CatalogProductItem[]>(initialItems)
  const [total, setTotal] = useState<number>(initialTotal)
  const [page, setPage] = useState<number>(1)
  const [query, setQuery] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>(lockedBrandSlug || 'ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>(lockedCategorySlug || 'ALL')
  const [sort, setSort] = useState<string>('featured')
  const [loading, setLoading] = useState<boolean>(false)

  const gridTopRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const didMountRef = useRef<boolean>(false)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const fetchProducts = useCallback(
    async (opts: {
      q: string
      brand: string
      category: string
      sort: string
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
        if (opts.brand && opts.brand !== 'ALL') params.set('brand', opts.brand)
        if (opts.category && opts.category !== 'ALL') params.set('category', opts.category)
        if (opts.sort && opts.sort !== 'featured') params.set('sort', opts.sort)
        params.set('page', String(opts.page))
        params.set('limit', String(pageSize))

        if (syncUrl && typeof window !== 'undefined') {
          const urlParams = new URLSearchParams()
          if (opts.q.trim()) urlParams.set('q', opts.q.trim())
          if (opts.brand && opts.brand !== 'ALL' && !lockedBrandSlug) urlParams.set('brand', opts.brand)
          if (opts.category && opts.category !== 'ALL' && !lockedCategorySlug) {
            urlParams.set('category', opts.category)
          }
          if (opts.page > 1) urlParams.set('page', String(opts.page))
          const qs = urlParams.toString()
          const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
          window.history.replaceState(null, '', nextUrl)
        }

        const res = await fetch(`/api/catalog/products?${params.toString()}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          setItems(data.items || [])
          setTotal(data.total ?? 0)
          setPage(data.page ?? opts.page)
          if (opts.scrollToTop) {
            gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Failed to query products:', err)
        }
      } finally {
        if (abortRef.current === controller) {
          setLoading(false)
        }
      }
    },
    [pageSize, syncUrl, lockedBrandSlug, lockedCategorySlug]
  )

  // Sync initial URL query params on mount if user landed with ?q=... / ?brand=... / ?category=... / ?page=...
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sp = new URLSearchParams(window.location.search)
    const urlQ = sp.get('q') || ''
    const urlBrand = lockedBrandSlug || sp.get('brand') || 'ALL'
    const urlCat = lockedCategorySlug || sp.get('category') || 'ALL'
    const urlPage = Math.max(1, Number(sp.get('page') || 1) || 1)
    const urlSort = sp.get('sort') || 'featured'

    const hasInitialFilters =
      urlQ !== '' ||
      (!lockedBrandSlug && urlBrand !== 'ALL') ||
      (!lockedCategorySlug && urlCat !== 'ALL') ||
      urlPage > 1 ||
      urlSort !== 'featured'

    if (hasInitialFilters) {
      setQuery(urlQ)
      setSelectedBrand(urlBrand)
      setSelectedCategory(urlCat)
      setPage(urlPage)
      setSort(urlSort)
      fetchProducts({ q: urlQ, brand: urlBrand, category: urlCat, sort: urlSort, page: urlPage })
    }
    didMountRef.current = true
  }, [fetchProducts, lockedBrandSlug, lockedCategorySlug])

  // Debounced search when query changes after mount
  useEffect(() => {
    if (!didMountRef.current) return
    const timer = setTimeout(() => {
      fetchProducts({
        q: query,
        brand: selectedBrand,
        category: selectedCategory,
        sort,
        page: 1,
      })
    }, 250)
    return () => clearTimeout(timer)
    // Only trigger debounce on query change; brand/category/sort/page trigger immediately below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const handleFilterChange = (next: {
    brand?: string
    category?: string
    sort?: string
    page?: number
    scrollToTop?: boolean
  }) => {
    const nextBrand = next.brand ?? selectedBrand
    const nextCat = next.category ?? selectedCategory
    const nextSort = next.sort ?? sort
    const nextPage = next.page ?? 1

    setSelectedBrand(nextBrand)
    setSelectedCategory(nextCat)
    setSort(nextSort)
    setPage(nextPage)

    fetchProducts({
      q: query,
      brand: nextBrand,
      category: nextCat,
      sort: nextSort,
      page: nextPage,
      scrollToTop: next.scrollToTop,
    })
  }

  const handleReset = () => {
    const defaultBrand = lockedBrandSlug || 'ALL'
    const defaultCat = lockedCategorySlug || 'ALL'
    setQuery('')
    setSelectedBrand(defaultBrand)
    setSelectedCategory(defaultCat)
    setSort('featured')
    setPage(1)
    fetchProducts({
      q: '',
      brand: defaultBrand,
      category: defaultCat,
      sort: 'featured',
      page: 1,
    })
  }

  const hasActiveFilter =
    query.trim() !== '' ||
    (!lockedBrandSlug && selectedBrand !== 'ALL') ||
    (!lockedCategorySlug && selectedCategory !== 'ALL') ||
    sort !== 'featured'

  return (
    <div ref={gridTopRef} className="space-y-6 scroll-mt-24">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools, model codes (e.g. PBT-ED-6RF, 13mm drill, grinder)..."
              className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-red-500 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Brand Filter */}
          {!lockedBrandSlug && brands.length > 0 && (
            <div className="md:col-span-2">
              <select
                value={selectedBrand}
                onChange={(e) => handleFilterChange({ brand: e.target.value, page: 1 })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-red-500 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-hidden transition"
              >
                <option value="ALL">All Brands ({brands.length})</option>
                {brands.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter */}
          {!lockedCategorySlug && categories.length > 0 && (
            <div className={lockedBrandSlug ? 'md:col-span-4' : 'md:col-span-3'}>
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange({ category: e.target.value, page: 1 })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-red-500 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-hidden transition"
              >
                <option value="ALL">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort */}
          <div className="md:col-span-2 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 hidden lg:block" />
            <select
              value={sort}
              onChange={(e) => handleFilterChange({ sort: e.target.value, page: 1 })}
              className="w-full bg-slate-50 border border-slate-300 focus:border-red-500 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-hidden transition"
            >
              <option value="featured">Featured First</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Status & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="w-3.5 h-3.5 text-red-600 animate-spin" />}
            <span>
              <strong className="text-slate-900">{total.toLocaleString()}</strong> matching tools found
              {totalPages > 1 ? ` • Page ${page} of ${totalPages}` : ''}
            </span>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleReset}
              className="text-red-600 hover:text-red-700 font-extrabold hover:underline cursor-pointer"
            >
              Reset Search & Filters
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {items.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl p-14 text-center border border-slate-200 space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No matching tools found</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Try clearing your filters or searching by tool type, wattage, or model number (e.g.
            &ldquo;Drill&rdquo;, &ldquo;Grinder&rdquo;, &ldquo;Powerbilt&rdquo;).
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-block bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-sm cursor-pointer"
          >
            Reset Catalog Filters
          </button>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 transition-opacity duration-150 ${
            loading ? 'opacity-60' : 'opacity-100'
          }`}
        >
          {items.map((prod) => (
            <ProductCard key={prod.id} product={prod} primaryPhone={primaryPhone} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        itemLabel="products"
        onPageChange={(nextPage) => handleFilterChange({ page: nextPage, scrollToTop: true })}
      />
    </div>
  )
}
