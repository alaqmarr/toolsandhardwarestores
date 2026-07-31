import React from 'react'
import Link from 'next/link'
import { Search, Filter, Wrench, ShieldCheck, Tag, X } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getContactSettings } from '@/lib/getSettings'
import ProductCard from '@/components/ProductCard'
import ProductsGlobalSearch from '@/components/ProductsGlobalSearch'

export const revalidate = 60

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string
    brand?: string
    category?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q, brand: brandSlug, category: categorySlug } = await searchParams
  const settings = await getContactSettings()

  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  })

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  // Build prisma filter
  const whereClause: any = {}

  if (q && q.trim()) {
    const tokens = q.trim().split(/\s+/).filter(Boolean)
    whereClause.AND = tokens.map((token) => ({
      OR: [
        { name: { contains: token } },
        { description: { contains: token } },
        { features: { contains: token } },
        { brand: { name: { contains: token } } },
        { category: { name: { contains: token } } },
      ],
    }))
  }

  if (brandSlug) {
    const matchedBrand = brands.find((b) => b.slug === brandSlug)
    if (matchedBrand) {
      whereClause.brandId = matchedBrand.id
    }
  }

  if (categorySlug) {
    const matchedCat = categories.find((c) => c.slug === categorySlug)
    if (matchedCat) {
      whereClause.categoryId = matchedCat.id
    }
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      brand: true,
      category: true,
    },
    orderBy: { isFeatured: 'desc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-24">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-black uppercase tracking-widest text-red-600">
            Industrial & Professional Tool Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Industrial Power Tools & Machinery
          </h1>
          <p className="text-slate-600 text-sm max-w-xl">
            Showing {products.length} professional equipment models. Click any tool to view full
            technical specifications, multiple images, video demonstrations, and genuine spare
            fitments.
          </p>
        </div>

        {/* Active filter badges */}
        {(q || brandSlug || categorySlug) && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/products"
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </Link>
          </div>
        )}
      </div>

      {/* Global Tool & Machinery Search */}
      <ProductsGlobalSearch />

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No matching tools found</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            We couldn&apos;t find any products matching your selected search query or brand filters. Try
            clearing the filter or searching for &quot;Bosch&quot;, &quot;DeWalt&quot;, or
            &quot;Ringsaw&quot;.
          </p>
          <Link
            href="/products"
            className="inline-block bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-sm"
          >
            Reset Catalog Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              primaryPhone={settings.primaryPhone}
            />
          ))}
        </div>
      )}
    </div>
  )
}
