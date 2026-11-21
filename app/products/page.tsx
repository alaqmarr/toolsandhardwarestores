import React from 'react'
import { prisma } from '@/lib/db'
import { getContactSettings } from '@/lib/getSettings'
import { queryProducts, DEFAULT_PAGE_SIZE } from '@/lib/catalogQueries'
import ProductCatalogClient from '@/components/ProductCatalogClient'

export const revalidate = 3600 // SSG ISR revalidation

export default async function ProductsPage() {
  const [settings, initialCatalog, brands, categories] = await Promise.all([
    getContactSettings(),
    queryProducts({ page: 1, limit: DEFAULT_PAGE_SIZE, sort: 'featured' }),
    prisma.brand.findMany({
      select: { name: true, slug: true },
      orderBy: [{ isCore: 'desc' }, { name: 'asc' }],
    }),
    prisma.category.findMany({
      select: { name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-12 space-y-10 pb-24">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-black uppercase tracking-widest text-red-600">
            Industrial & Professional Tool Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Industrial Power Tools & Machinery
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl">
            Browse {initialCatalog.total.toLocaleString()} professional equipment models. Search by
            model, brand, or wattage and click any tool to view full technical specifications,
            images, video demos, and genuine spare fitments.
          </p>
        </div>
      </div>

      {/* Search, Filter & Paginated Grid */}
      <ProductCatalogClient
        initialItems={initialCatalog.items}
        initialTotal={initialCatalog.total}
        pageSize={DEFAULT_PAGE_SIZE}
        brands={brands}
        categories={categories}
        primaryPhone={settings.primaryPhone}
        syncUrl={true}
      />
    </div>
  )
}
