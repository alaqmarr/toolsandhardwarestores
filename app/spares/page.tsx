import React from 'react'
import Link from 'next/link'
import { Wrench, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getContactSettings } from '@/lib/getSettings'
import SparesCatalogClient from '@/components/SparesCatalogClient'

export const revalidate = 60

export default async function SparesPage() {
  const settings = await getContactSettings()

  // 1. Fetch all top-level spare categories
  const topCategories = await prisma.spareCategory.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  // 2. Fetch all spares with their category and compatible tool fitments
  const spares = await prisma.spare.findMany({
    include: {
      spareCategory: {
        include: {
          parent: true,
        },
      },
      products: {
        include: {
          product: {
            include: {
              brand: true,
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-8 space-y-3">
        <div className="text-xs font-black uppercase tracking-widest text-red-600">
          Genuine Replacement Spares & Accessories
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Genuine Spare Parts & Armatures
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
          Explore our complete inventory of armatures, rotors, stators, universal carbon brushes,
          switches, and gears. All spares are original factory direct and ready for immediate dispatch.
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

      {/* Interactive Catalog Client (Search, Filters, Subcategories & Modal) */}
      <SparesCatalogClient
        initialSpares={spares}
        topCategories={topCategories}
        primaryPhone={settings.primaryPhone}
      />
    </div>
  )
}
