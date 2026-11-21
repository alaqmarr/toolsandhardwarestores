'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Wrench, ShieldCheck, Tag, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'
import ShareButton from './ShareButton'
import { getWhatsAppInquiryUrl } from '@/lib/whatsapp'

interface SpareDetailClientProps {
  spare: {
    id: string
    name: string
    slug: string
    description: string | null
    images: string
    priceNote: string | null
    spareCategory: {
      id: string
      name: string
      slug: string
      parent: {
        name: string
      } | null
    } | null
    products: {
      product: {
        id: string
        name: string
        slug: string
        images: string
        brand: {
          name: string
          slug: string
        }
        category: {
          name: string
        }
      }
    }[]
  }
  primaryPhone: string
}

export default function SpareDetailClient({ spare, primaryPhone }: SpareDetailClientProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  let imageList: string[] = []
  try {
    imageList = JSON.parse(spare.images)
  } catch {
    imageList = [spare.images]
  }
  if (!Array.isArray(imageList) || imageList.length === 0) {
    imageList = ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80']
  }

  const waUrl = getWhatsAppInquiryUrl({
    phone: primaryPhone,
    itemName: spare.name,
    itemType: 'Spare Part',
    itemSlug: spare.slug,
    extraNotes: `Category: ${
      spare.spareCategory
        ? `${spare.spareCategory.parent ? `${spare.spareCategory.parent.name} -> ` : ''}${spare.spareCategory.name}`
        : 'Uncategorized'
    }`,
  })

  return (
    <div className="space-y-12">
      {/* Breadcrumbs & Share Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-slate-900 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/spares" className="hover:text-slate-900 transition">
            Spares
          </Link>
          {spare.spareCategory?.parent && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600">{spare.spareCategory.parent.name}</span>
            </>
          )}
          {spare.spareCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600">{spare.spareCategory.name}</span>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-red-600 font-bold truncate max-w-sm">{spare.name}</span>
        </div>

        <ShareButton
          title={spare.name}
          text={`Check out ${spare.name} at Tools & Hardware Stores!`}
          buttonText="Share Spare"
        />
      </div>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
        {/* Left Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="w-full h-80 sm:h-[440px] rounded-3xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative shadow-sm">
            <img
              src={imageList[activeImageIdx] || imageList[0]}
              alt={spare.name}
              className="max-h-full max-w-full object-contain p-6"
            />
            {imageList.length > 1 && (
              <div className="absolute top-4 right-4 bg-slate-900/85 text-white text-xs font-mono px-3 py-1 rounded-lg border border-slate-700">
                {activeImageIdx + 1} / {imageList.length}
              </div>
            )}
          </div>

          {imageList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imageList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 bg-white cursor-pointer ${
                    activeImageIdx === idx
                      ? 'border-red-500 ring-2 ring-red-500/20 shadow-sm'
                      : 'border-slate-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${spare.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain p-1.5"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  {spare.spareCategory?.parent ? `${spare.spareCategory.parent.name} • ` : ''}
                  {spare.spareCategory?.name || 'Genuine Spare Part'}
                </span>
                {spare.products.length > 0 && (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                    Fits {spare.products.length} {spare.products.length === 1 ? 'Model' : 'Models'}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 leading-tight">
                {spare.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {spare.description || 'Industrial replacement spare available for immediate dispatch.'}
              </p>
            </div>

            {spare.priceNote && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <Tag className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Fitment & Supply Note
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">{spare.priceNote}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Genuine OEM Fitment</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                <Wrench className="w-4 h-4 text-red-600 shrink-0" />
                <span>Wholesale & Counter Dispatch</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
                href="/spares"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold py-4 px-5 rounded-2xl flex items-center justify-center gap-2 transition shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Spares</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Compatible Tools Grid */}
      <div className="border-t border-slate-200 pt-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-red-500" />
            <span>Compatible Power Tools & Equipment ({spare.products.length})</span>
          </h2>
          <Link href="/products" className="text-xs font-bold text-red-600 hover:underline">
            Browse Full Tool Catalog →
          </Link>
        </div>

        {spare.products.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-sm text-slate-600">
            Universal or model-specific OEM spare part — contact us on WhatsApp to confirm
            compatibility with your exact machine serial/model number.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {spare.products.map(({ product }) => {
              let pImgs: string[] = []
              try {
                pImgs = JSON.parse(product.images)
              } catch {
                pImgs = [product.images]
              }
              const thumb = pImgs[0]

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-red-400 transition flex items-center gap-4 group shadow-sm hover:shadow-md"
                >
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                    {thumb && (
                      <img
                        src={thumb}
                        alt={product.name}
                        loading="lazy"
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-red-600 font-extrabold uppercase tracking-wider">
                      {product.brand.name}
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition line-clamp-2">
                      {product.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {product.category.name}
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
