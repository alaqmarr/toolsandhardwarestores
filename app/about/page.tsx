import React from 'react'
import Link from 'next/link'
import {
  Wrench,
  MapPin,
  ShieldCheck,
  Award,
  Truck,
  CheckCircle2,
  Users,
  Building2,
} from 'lucide-react'
import { getContactSettings } from '@/lib/getSettings'
import { prisma } from '@/lib/db'

export const revalidate = 60

export default async function AboutPage() {
  const [settings, brands, categoryCount, productCount, spareCount] = await Promise.all([
    getContactSettings(),
    prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ isCore: 'desc' }, { name: 'asc' }],
    }),
    prisma.category.count(),
    prisma.product.count(),
    prisma.spare.count(),
  ])

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO HEADER */}
      <section className="relative pt-12 pb-16 border-b border-slate-200 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full px-4 sm:px-6 lg:px-10 space-y-8">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full text-xs font-bold text-red-800">
              <Award className="w-3.5 h-3.5 text-red-600" />
              <span>WHOLESALE &amp; MULTI-BRAND RETAIL ESTABLISHMENT</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              About Tools & Hardware Stores
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              We are the premier one-stop destination for industrial power tools, heavy
              machinery, ringsaw cutters, and genuine factory spares.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="text-2xl sm:text-3xl font-black text-red-600">{productCount.toLocaleString()}+</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mt-1">Industrial Tools & Models</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{spareCount.toLocaleString()}+</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mt-1">Genuine Spare Parts</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{brands.length}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mt-1">Authorized Brands</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{categoryCount}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mt-1">Equipment Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STORE OVERVIEW & HIGHLIGHTS */}
      <section className="w-full px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Industrial Showroom & Fulfillment Hub
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Secunderabad & Hyderabad Industrial Supply
            </p>
            <div className="pt-2 text-xs font-bold text-red-600">
              Ready Store Counter Supply
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Two Secunderabad Locations
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Visit THS HQ in Victoria Ranigunj or THS Exclusive Showroom on K Street, Ranigunj.
            </p>
            <div className="pt-2 text-xs font-bold text-red-600">
              Open Mon–Sun • Counter Pickup
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              100% Genuine Inventory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every tool, spare part, armature, and accessory is guaranteed 100% genuine with warranty.
            </p>
            <div className="pt-2 text-xs font-bold text-red-600">
              100% Genuine Warranty & Support
            </div>
          </div>
        </div>

        {/* SECTION 2: CORE BRANDS */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 mt-16">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-red-600">
              WHOLESALE DISTRIBUTORSHIPS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Specialized Brands & Core Distributorships
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We are recognized as a major regional distributor for leading industrial brands. Whether
              you need rotary hammers, heavy demolition breakers, high-pressure washers, or
              precision laser level for interior fit-outs, our wholesale warehouse stocks the exact
              tool for the job.
            </p>
          </div>

          {/* Brands Showcase Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 pt-4 border-t border-slate-200">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/brands/${b.slug}`}
                className="bg-slate-50 hover:bg-red-50/50 border border-slate-200 hover:border-red-500/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-center transition group"
              >
                {b.image && (
                  <div className="h-12 w-full flex items-center justify-center">
                    <img
                      src={b.image}
                      alt={b.name}
                      className="max-h-full max-w-[80%] object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="font-extrabold text-slate-900 group-hover:text-red-600 text-sm">
                  {b.name}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 group-hover:text-red-500">
                  {b.isCore ? 'Core Partner' : 'Brand Dealer'} • {b._count.products} Models
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SECTION 3: WHOLESALE BENCHMARKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              100% Genuine Tool Guarantee
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every power tool, industrial equipment, and spare armature comes with verifiable serial numbers and manufacturer warranty support.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <Truck className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              Ready Counter Supply
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rapid store counter fulfillment and immediate store pickup from our Ranigunj wholesale warehouse for commercial contractors and workshops.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              Genuine Spare Parts Hub
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We stock authentic armatures, stators, gears, and universal carbon brushes so your
              tools never experience costly downtime.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <Users className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              Wholesale Contractor Pricing
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct factory-level pricing for bulk procurement, commercial builders, interior
              designers, and industrial fabrication shops.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA BANNER */}
      <section className="w-full px-4 sm:px-6 lg:px-10">
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-white shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Ready to Upgrade Your Tool Inventory?
            </h3>
            <p className="text-slate-300 text-sm">
              Connect with our wholesale experts on WhatsApp for an instant quotation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold px-6 py-4 rounded-xl transition shadow-md"
            >
              Contact Support
            </Link>
            <Link
              href="/products"
              className="bg-white/10 hover:bg-white/15 text-white font-bold px-6 py-4 rounded-xl border border-white/15 transition"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
