'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Share2,
  ChevronRight,
  Video,
  Info,
  ExternalLink,
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

  // Parse JSON images
  let imageList: string[] = []
  try {
    imageList = JSON.parse(product.images)
  } catch {
    imageList = [product.images]
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
            href={`/categories/${product.category.slug}`}
            className="hover:text-slate-900 transition"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold truncate max-w-xs">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Gallery & Video Viewer (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="w-full h-80 sm:h-[420px] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative shadow-md">
            {isVideoActive ? (
              <iframe
                src={product.videoUrl || ''}
                title={product.name}
                className="w-full h-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
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

            {/* Media indicator */}
            <div className="absolute top-4 right-4 bg-slate-900/80 text-white text-xs font-mono px-3 py-1 rounded-lg border border-slate-700 shadow-sm">
              {isVideoActive ? 'VIDEO DEMO' : `${activeMediaIndex + 1} / ${imageList.length}`}
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
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 bg-slate-100 ${
                    activeMediaIndex === idx
                      ? 'border-red-500 scale-95 shadow-sm'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}

              {hasVideo && (
                <button
                  type="button"
                  onClick={() => setActiveMediaIndex(imageList.length)}
                  className={`w-20 h-20 rounded-2xl border-2 transition shrink-0 bg-slate-100 flex flex-col items-center justify-center gap-1 ${
                    isVideoActive
                      ? 'border-red-500 bg-red-100 text-red-900 scale-95 shadow-sm'
                      : 'border-slate-200 opacity-70 hover:opacity-100 text-slate-700'
                  }`}
                >
                  <Video className="w-6 h-6 text-red-600" />
                  <span className="text-[10px] font-bold">Watch Video</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Technical Details & CTA (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link
                href={`/brands/${product.brand.slug}`}
                className="bg-red-100 text-red-900 text-xs font-extrabold px-3 py-1 rounded-full border border-red-300 hover:bg-red-200 transition"
              >
                {product.brand.name}
              </Link>
              <Link
                href={`/categories/${product.category.slug}`}
                className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-200 transition"
              >
                {product.category.name}
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            <p className="text-base text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Key Features bullet points */}
          {featureList.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Industrial Feature Highlights
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {featureList.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-slate-700 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp Action CTA */}
          <div className="pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-base font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-md hover:scale-[1.01] active:scale-95 transition"
            >
              <WhatsAppIcon className="w-5 h-5 text-white" />
              <span>Enquire on WhatsApp</span>
            </a>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Instant response from our store desk ({primaryPhone})
            </p>
          </div>
        </div>
      </div>

      {/* 2. SPECIFICATIONS & GENUINE SPARE FITMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 border-t border-slate-200">
        {/* Left: Specifications Table (col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
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
                      className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}
                    >
                      <th className="py-3 px-4 font-bold text-slate-700 w-1/3 border-r border-slate-100">
                        {key}
                      </th>
                      <td className="py-3 px-4 text-slate-900 font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Compatible Spares List (col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
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

          {product.spares.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2 shadow-sm">
              <div className="text-sm font-bold text-slate-900">
                Universal Replacement Spares Available
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                We stock armatures, rotors, stators, carbon brushes, switches, and gears for this
                model in our inventory. Contact us on WhatsApp for exact part
                numbers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.spares.map(({ spare }) => {
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
                        className="w-14 h-14 rounded-xl object-contain bg-slate-100 shrink-0 border border-slate-200 p-1"
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] text-red-700 font-bold uppercase">
                          {spare.spareCategory?.name || 'Uncategorized'}
                        </div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition truncate">
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
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-900 transition shrink-0 ml-2"
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
