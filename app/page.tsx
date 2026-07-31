import React from 'react'
import Link from 'next/link'
import {
  Wrench,
  ShieldCheck,
  Star,
  ArrowRight,
  MapPin,
  Award,
  Truck,
  CheckCircle,
} from 'lucide-react'
import WhatsAppIcon from '@/components/WhatsAppIcon'
import { prisma } from '@/lib/db'
import { getContactSettings } from '@/lib/getSettings'
import ProductCard from '@/components/ProductCard'

export const revalidate = 60 // ISR revalidation every 60 seconds

export default async function HomePage() {
  const settings = await getContactSettings()

  // Fetch featured products, categories, and brands dynamically from database
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    include: {
      brand: true,
      category: true,
    },
    take: 8,
  })

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  })

  const whatsappUrl = `https://wa.me/${settings.primaryPhone.replace(
    /[^0-9]/g,
    ''
  )}?text=${encodeURIComponent(
    'Hello Tools & Hardware Stores, I would like to enquire about your power tools and industrial spares.'
  )}`

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden min-h-[620px] lg:min-h-[700px] flex items-center justify-center rounded-3xl mx-3 sm:mx-6 lg:mx-8 mt-2 mb-10 shadow-2xl border border-slate-800 bg-slate-950">
        {/* Full Background Image with Cinematic Industrial Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero.png"
            alt="Tools & Hardware Industrial Background"
            className="w-full h-full object-cover object-center scale-105 transform transition duration-1000"
          />
          {/* Multi-layered dark industrial gradient overlay for 100% legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/75 to-slate-950/90" />
          {/* Ambient Glowing Orbs: Crimson Red & Steel Blue */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 w-full text-center flex flex-col items-center">
          <div className="space-y-8 flex flex-col items-center">
            {/* Rating & Dispatch Pill */}
            <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-slate-900/85 border border-slate-700/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg">
              <span className="flex items-center gap-1.5 text-red-400 font-extrabold text-xs sm:text-sm tracking-wide">
                <Star className="w-4 h-4 fill-red-500 text-red-500" />
                4.9★ RATED (379+ REVIEWS)
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                Ranigunj HQ • Ready Stock & Counter Supply
              </span>
            </div>

            {/* High-Impact Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-lg max-w-4xl">
              THE PREMIER{' '}
              <span className="bg-gradient-to-r from-red-500 via-red-600 to-rose-500 bg-clip-text text-transparent">
                INDUSTRIAL POWER TOOL
              </span>{' '}
              & MACHINERY DESTINATION
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl font-normal leading-relaxed">
              We supply authentic heavy-duty tools, ringsaw cutters, demolition hammers, and genuine spares directly to commercial contractors, engineering plants, and construction professionals across Secunderabad & Hyderabad.
            </p>

            {/* CTA Action Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/products"
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl hover:shadow-red-600/30 transition flex items-center gap-3 text-base sm:text-lg"
              >
                <span>Explore Full Inventory</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl hover:shadow-emerald-600/30 transition flex items-center gap-3 text-base sm:text-lg"
              >
                <WhatsAppIcon className="w-5 h-5 fill-current" />
                <span>Enquire on WhatsApp</span>
              </a>
              <Link
                href="/contact"
                className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-extrabold px-7 py-4 rounded-2xl backdrop-blur-md transition flex items-center gap-2.5 text-base sm:text-lg"
              >
                <MapPin className="w-5 h-5 text-red-500" />
                <span>Find Closest Store</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-slate-200 text-xs sm:text-sm font-extrabold tracking-wide">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                <span>10,000+ Tools in Stock</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
                <span>Authorized Warranty Support</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                <span>Ready Store Counter Pickup</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
                <span>100% Genuine Spare Parts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INFINITE AUTO-SCROLLING BRANDS SLIDER (WITH SUBTLE ICE BLUE GRADIENT) */}
      <section className="overflow-hidden py-12 bg-gradient-to-r from-white via-blue-50/60 to-white border-y border-blue-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex items-center justify-between">
          <div className="text-xs font-black tracking-widest uppercase text-slate-400">
            AUTHORIZED BRANDS & PROFESSIONAL MANUFACTURERS
          </div>
          <Link
            href="/brands"
            className="text-xs font-bold text-red-600 hover:text-red-700 transition"
          >
            View All Brands →
          </Link>
        </div>

        <div className="relative flex overflow-hidden">
          <div className="flex gap-16 items-center animate-marquee whitespace-nowrap">
            {[...brands, ...brands].map((brand, idx) => (
              <div
                key={`${brand.id}-${idx}`}
                className="flex items-center justify-center w-36 sm:w-44 h-16 shrink-0 opacity-80 hover:opacity-100 transition-all transform hover:scale-105"
              >
                {brand.image ? (
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-black text-slate-800">
                    {brand.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TOOL CATEGORIES SHOWCASE WITH SUBTLE BLUE GRADIENT WRAPPER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 rounded-3xl bg-gradient-to-br from-white via-blue-50/45 to-slate-50 border border-blue-100/80 shadow-xs my-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-red-600 mb-1">
              Comprehensive Inventory
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Explore Our Tool & Equipment Categories
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-sm font-bold text-red-600 hover:text-red-700 transition flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="bg-white rounded-2xl overflow-hidden group flex flex-col h-72 border border-blue-100/80 hover:border-red-500 transition-all duration-300 relative shadow-sm hover:shadow-md"
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={
                    cat.image ||
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-70" />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-blue-50/30">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-extrabold text-red-600 pt-3 border-t border-blue-100/60">
                  <span>Explore Equipment</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS & HEAVY MACHINERY WITH SUBTLE BLUE GRADIENT WRAPPER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50/50 to-white border border-blue-100/80 shadow-xs my-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-red-600 mb-1">
              Top Rated by Industrial Contractors Worldwide
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Featured Power Tools & Heavy Machinery
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-bold text-red-600 hover:text-red-700 transition flex items-center gap-1"
          >
            <span>View Full Product Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              primaryPhone={settings.primaryPhone}
            />
          ))}
        </div>
      </section>

      {/* 5. GENUINE SPARES & ARMATURES HIGHLIGHT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl border border-red-500/40 p-8 sm:p-12 shadow-xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className="bg-red-500/20 text-red-300 text-xs font-extrabold px-3.5 py-1 rounded-full border border-red-500/40">
                100% GENUINE PARTS IN STOCK
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Looking for Armatures, Rotors, Stators or Universal Carbon Brushes?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                We stock genuine factory-direct spares for Bosch, DeWalt, Hitachi (Hikoki),
                Makita, and Powerbilt Ringsaw cutters. Every spare part listed includes an interactive
                modal showing exact compatible tool fitments and direct WhatsApp inquiry.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/spares"
                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold py-4 px-6 rounded-2xl text-center shadow-lg transition"
              >
                Browse All Spares & Armatures
              </Link>
              <Link
                href="/contact#locator"
                className="bg-white/10 hover:bg-white/15 text-white font-bold py-4 px-6 rounded-2xl text-center border border-white/15 transition"
              >
                Visit Our Store & Locator
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
