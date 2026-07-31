import React from 'react'
import Link from 'next/link'
import { ArrowRight, Wrench, Package, ShieldCheck, Award, Star } from 'lucide-react'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Authorized Tool Brands | Tools & Hardware Stores - Worldwide Industrial Dealer',
  description:
    'Explore authorized tool brands stocked at Tools & Hardware Stores. Major distributor for Bosch, DeWalt, Hitachi (Hikoki), Makita, Stanley, Black & Decker, and more.',
}

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: [
      { isCore: 'desc' },
      { name: 'asc' },
    ],
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24">
      {/* Header */}
      <div className="border-b border-slate-200 pb-8 space-y-3">
        <div className="text-xs font-black text-red-600 uppercase tracking-widest">
          Authorized Distributor Network
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Professional Tool Brands & Manufacturers
        </h1>
        <p className="text-slate-600 max-w-2xl text-sm sm:text-base leading-relaxed">
          We are major wholesale distributors and authorized stockists for the world’s leading industrial power tool and hardware brands. Browse our authorized brands below to explore dedicated product catalogs with genuine warranty support.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="bg-white rounded-2xl overflow-hidden group flex flex-col border border-slate-200 hover:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            {/* Logo Banner */}
            <div className="relative h-48 overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center p-8">
              <img
                src={
                  brand.image ||
                  'https://upload.wikimedia.org/wikipedia/commons/4/4b/Robert_Bosch_GmbH_logo.svg'
                }
                alt={brand.name}
                className="max-h-24 max-w-[70%] object-contain group-hover:scale-105 transition-transform duration-500"
              />

              {/* Distributor Badge */}
              <div className="absolute top-3 left-3">
                {brand.isCore ? (
                  <span className="bg-red-50 text-red-900 text-[10px] font-extrabold px-3 py-1 rounded-full border border-red-300 flex items-center gap-1 shadow-2xs">
                    <Star className="w-3 h-3 fill-red-500 text-red-500" />
                    Core Distributor
                  </span>
                ) : (
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-300">
                    Specialty Professional
                  </span>
                )}
              </div>

              {/* Product Count Badge */}
              <div className="absolute bottom-3 right-3 bg-white text-slate-800 text-xs font-bold px-3 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 shadow-xs">
                <Package className="w-3.5 h-3.5 text-red-600" />
                <span>{brand._count.products} Models</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4 bg-white">
              <div>
                <h2 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition">
                  {brand.name}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {brand.description ||
                    `Authorized wholesale distributor for ${brand.name} power tools, heavy machinery, and industrial accessories worldwide.`}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-red-600">
                <span>View {brand.name} Showroom</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Trust Guarantee Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1.5 rounded-full border border-red-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Genuine Manufacturer Warranty</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Why Buy Authorized Brands from Tools & Hardware Stores?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            As a leading multi-brand industrial distributor, we supply authentic factory-fresh tools with complete GST invoicing and direct service center warranty backing. Every tool is inspected and verified before dispatch.
          </p>
        </div>
      </div>
    </div>
  )
}
