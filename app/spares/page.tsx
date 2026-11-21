import React from 'react'
import { Wrench, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getContactSettings } from '@/lib/getSettings'
import { querySpares, DEFAULT_PAGE_SIZE } from '@/lib/catalogQueries'
import SparesCatalogClient from '@/components/SparesCatalogClient'

export const revalidate = 60

export default async function SparesPage() {
  const [settings, topCategories, initialCatalog] = await Promise.all([
    getContactSettings(),
    prisma.spareCategory.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    }),
    querySpares({ page: 1, limit: DEFAULT_PAGE_SIZE }),
  ])

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-12 space-y-12 pb-24">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-8 space-y-3">
        <div className="text-xs font-black uppercase tracking-widest text-red-600">
          Genuine Replacement Spares & Accessories
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Genuine Spare Parts & Armatures
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
          Explore our complete inventory of {initialCatalog.total.toLocaleString()} armatures,
          rotors, stators, universal carbon brushes, switches, and gears. All spares are original
          factory direct and ready for immediate dispatch.
        </p>

        {/* Confidence badges */}
        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Genuine Factory Spares</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
            <span>Exact Fitment Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-red-500 shrink-0" />
            <span>WhatsApp Fitment Advice</span>
          </div>
        </div>
      </div>

      {/* Interactive Catalog Client (Server-backed Search, Filters, Subcategories & Pagination) */}
      <SparesCatalogClient
        initialSpares={initialCatalog.items}
        initialTotal={initialCatalog.total}
        pageSize={DEFAULT_PAGE_SIZE}
        topCategories={topCategories}
        primaryPhone={settings.primaryPhone}
      />
    </div>
  )
}
