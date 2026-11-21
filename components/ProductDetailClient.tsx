'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Video,
  Info,
  Search,
  Award,
  Package,
  ArrowUpRight,
} from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'
import SpareModal from './SpareModal'
import ShareButton from './ShareButton'
import { getWhatsAppInquiryUrl } from '@/lib/whatsapp'

interface ProductDetailClientProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    images: string
    features: string | null
    specifications?: string | null
    isFeatured: boolean
    videoUrl: string | null
    brand: {
      name: string
      slug: string
    }
    category: {
      name: string
      slug: string
    }
    spares: {
      spare: {
        id: string
        name: string
        slug: string
        description: string | null
        images: string
        priceNote: string | null
        spareCategory: {
          name: string
          parent: {
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
    }[]
  }
  primaryPhone: string
}

export default function ProductDetailClient({
  product,
  primaryPhone,
}: ProductDetailClientProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0) // 0..images.length-1, or images.length if video
  const [activeModalSpare, setActiveModalSpare] = useState<any | null>(null)
  const [spareFilter, setSpareFilter] = useState<string>('')

  // Parse JSON images
  let imageList: string[] = []
  try {
    imageList = JSON.parse(product.images)
  } catch {
    imageList = [product.images]
  }
  if (!Array.isArray(imageList) || imageList.length === 0) {
    imageList = ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80']
  }

  // Parse features
  let featureList: string[] = []
  try {
    if (product.features) featureList = JSON.parse(product.features)
  } catch {
    featureList = []
  }

  // Parse specs
  let specsObj: Record<string, string> = {}
  try {
    if (product.specifications) specsObj = JSON.parse(product.specifications)
  } catch {
    specsObj = {}
  }

  const hasVideo = Boolean(product.videoUrl)
  const totalMediaCount = imageList.length + (hasVideo ? 1 : 0)
  const isVideoActive = hasVideo && activeMediaIndex === imageList.length

  const filteredSpares = useMemo(() => {
    const q = spareFilter.trim().toLowerCase()
    if (!q) return product.spares
    return product.spares.filter(({ spare }) => {
      return (
        spare.name.toLowerCase().includes(q) ||
        (spare.priceNote && spare.priceNote.toLowerCase().includes(q)) ||
        (spare.spareCategory?.name && spare.spareCategory.name.toLowerCase().includes(q))
      )
    })
  }, [product.spares, spareFilter])

  const waUrl = getWhatsAppInquiryUrl({
    phone: primaryPhone,
    itemName: product.name,
    itemType: 'Product',
    itemSlug: product.slug,
    extraNotes: `Brand: ${product.brand.name} | Category: ${product.category.name}`,
  })

  return (
    <div className="space-y-12">
      {/* Top Breadcrumb & Share Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-slate-900 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/products" className="hover:text-slate-900 transition">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href={`/brands/${product.brand.slug}`}
            className="hover:text-slate-900 transition"
          >
            {product.brand.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href={`/categories/${product.category.slug}`}
            className="hover:text-slate-900 transition"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold truncate max-w-sm">
            {product.name}
          </span>
        </div>

        <ShareButton
          title={product.name}
          text={`Check out ${product.name} at Tools & Hardware Stores!`}
          buttonText="Share Product"
        />
      </div>

      {/* Main Product Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
        {/* Left: Gallery & Video Viewer (col-span-6) */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-28">
          <div className="w-full h-80 sm:h-[460px] rounded-3xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative shadow-sm">
            {isVideoActive ? (
              /\.(mp4|webm|mov|m4v)(\?|$)/i.test(product.videoUrl || '') ? (
                <video
                  src={product.videoUrl || ''}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <iframe
                  src={product.videoUrl || ''}
                  title={product.name}
                  className="w-full h-full object-cover"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : (
              <img
                src={imageList[activeMediaIndex] || imageList[0]}
                alt={product.name}
                className="max-h-full max-w-full object-contain p-6"
              />
            )}

            {/* Featured Badge */}
            {product.isFeatured && (
              <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Featured Tool
              </div>
            )}

            {/* Media indicator & quick video toggle */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {hasVideo && !isVideoActive && (
                <button
                  type="button"
                  onClick={() => setActiveMediaIndex(imageList.length)}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Demo</span>
                </button>
              )}
              <div className="bg-slate-900/85 text-white text-xs font-mono px-3 py-1 rounded-lg border border-slate-700 shadow-sm">
                {isVideoActive ? 'VIDEO DEMO' : `${activeMediaIndex + 1} / ${imageList.length}`}
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          {totalMediaCount > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imageList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 bg-white cursor-pointer ${
                    activeMediaIndex === idx
                      ? 'border-red-500 ring-2 ring-red-500/20 shadow-sm'
                      : 'border-slate-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain p-1.5"
                  />
                </button>
              ))}

              {hasVideo && (
                <button
                  type="button"
                  onClick={() => setActiveMediaIndex(imageList.length)}
                  className={`w-20 h-20 rounded-2xl border-2 transition shrink-0 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isVideoActive
                      ? 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500/20 shadow-sm'
                      : 'border-slate-200 bg-white opacity-80 hover:opacity-100 text-slate-700'
                  }`}
                >
                  <Video className="w-6 h-6 text-red-600" />
                  <span className="text-[10px] font-bold">Watch Video</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Technical Details & CTA (col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/brands/${product.brand.slug}`}
                className="bg-red-100 text-red-900 text-xs font-extrabold px-3.5 py-1 rounded-full border border-red-300 hover:bg-red-200 transition"
              >
                {product.brand.name}
              </Link>
              <Link
                href={`/categories/${product.category.slug}`}
                className="bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-1 rounded-full border border-slate-200 hover:bg-slate-200 transition"
              >
                {product.category.name}
              </Link>
              {product.spares.length > 0 && (
                <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                  {product.spares.length} Genuine Spares Stocked
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Trust Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Genuine OEM</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                <Award className="w-4 h-4 text-red-600 shrink-0" />
                <span>Manufacturer Warranty</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                <Package className="w-4 h-4 text-blue-600 shrink-0" />
                <span>GST Wholesale Supply</span>
              </div>
            </div>

            {/* WhatsApp Action CTA + Brand Showroom Link */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-base font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-md hover:scale-[1.01] active:scale-95 transition"
                >
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                  <span>Enquire on WhatsApp</span>
                </a>

                <Link
                  href={`/brands/${product.brand.slug}`}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-4 px-5 rounded-2xl flex items-center justify-center gap-2 transition shrink-0"
                >
                  <span>More {product.brand.name}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-500 text-center sm:text-left">
                Instant wholesale & retail quotation from our store desk ({primaryPhone})
              </p>
            </div>
          </div>

          {/* Key Features bullet points */}
          {featureList.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Industrial Feature Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {featureList.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. SPECIFICATIONS & GENUINE SPARE FITMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 pt-8 border-t border-slate-200">
        {/* Left: Specifications Table (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">
              Technical Specifications
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Factory Rated
            </span>
          </div>

          {Object.keys(specsObj).length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
              Standard manufacturer specifications apply for this equipment model.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(specsObj).map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}
                    >
                      <th className="py-3 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-600 w-2/5 border-r border-slate-100">
                        {key}
                      </th>
                      <td className="py-3 px-4 text-slate-900 font-semibold">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Compatible Spares List (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Wrench className="w-6 h-6 text-red-600" />
              <span>Compatible Genuine Spares ({product.spares.length})</span>
            </h2>
            <Link
              href="/spares"
              className="text-xs font-bold text-red-700 hover:underline"
            >
              View All Spares →
            </Link>
          </div>

          {product.spares.length > 6 && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={spareFilter}
                onChange={(e) => setSpareFilter(e.target.value)}
                placeholder={`Filter ${product.spares.length} compatible spares (e.g. armature, switch, bearing, brush)...`}
                className="w-full bg-white border border-slate-200 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden shadow-2xs"
              />
            </div>
          )}

          {product.spares.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2 shadow-sm">
              <div className="text-sm font-bold text-slate-900">
                Universal Replacement Spares Available
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                We stock armatures, rotors, stators, carbon brushes, switches, and gears for this
                model in our inventory. Contact us on WhatsApp for exact part numbers.
              </p>
            </div>
          ) : filteredSpares.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-sm text-slate-500">
              No compatible spares match &ldquo;{spareFilter}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredSpares.map(({ spare }) => {
                let sImg: string[] = []
                try {
                  sImg = JSON.parse(spare.images)
                } catch {
                  sImg = [spare.images]
                }
                const mainSImg = sImg[0]

                return (
                  <div
                    key={spare.id}
                    onClick={() => setActiveModalSpare(spare)}
                    className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-400 transition flex items-center justify-between group shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={mainSImg}
                        alt={spare.name}
                        loading="lazy"
                        className="w-14 h-14 rounded-xl object-contain bg-white shrink-0 border border-slate-200 p-1"
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] text-red-700 font-bold uppercase truncate">
                          {spare.spareCategory?.name || 'Genuine Spare'}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-700 transition line-clamp-2">
                          {spare.name}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveModalSpare(spare)
                      }}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-900 transition shrink-0 ml-2 cursor-pointer"
                      title="Check fitment details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Spare Modal */}
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
