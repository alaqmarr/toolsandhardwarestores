'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import {
  X,
  CheckCircle2,
  Tag,
  Wrench,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'
import { getWhatsAppInquiryUrl } from '@/lib/whatsapp'

interface SpareItem {
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
  }
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

interface SpareModalProps {
  spare: SpareItem
  primaryPhone: string
  onClose: () => void
}

export default function SpareModal({
  spare,
  primaryPhone,
  onClose,
}: SpareModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  let imageList: string[] = []
  try {
    imageList = JSON.parse(spare.images)
  } catch {
    imageList = [spare.images]
  }
  const mainImg = imageList[0]

  const waUrl = getWhatsAppInquiryUrl({
    phone: primaryPhone,
    itemName: spare.name,
    itemType: 'Spare Part',
    itemSlug: spare.slug,
    extraNotes: `Category: ${
      spare.spareCategory.parent ? `${spare.spareCategory.parent.name} -> ` : ''
    }${spare.spareCategory.name}`,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
              {spare.spareCategory.parent ? `${spare.spareCategory.parent.name} • ` : ''}
              {spare.spareCategory.name}
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 pr-4">
              {spare.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Image */}
            <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative shadow-sm">
              <img
                src={mainImg}
                alt={spare.name}
                className="max-h-full max-w-full object-contain p-4"
              />
            </div>

            {/* Price & Description */}
            <div className="space-y-4">

              <div className="space-y-2">
                <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wide">
                  Technical Description
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {spare.description ||
                    'Industrial spare part available for immediate dispatch.'}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/spares/${spare.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold hover:underline"
                >
                  <span>Open Dedicated Spare Detail Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Compatible Tool Fitments List */}
          <div className="border-t border-slate-200 pt-6 space-y-3">
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
              <Wrench className="w-4 h-4 text-red-500" />
              <span>Compatible Tool Fitment Models ({spare.products.length})</span>
            </h4>

            {spare.products.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Universal spare part - contact us on WhatsApp to verify compatibility for your specific model.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {spare.products.map(({ product }) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-400 transition flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="text-[10px] text-red-600 font-bold uppercase">
                        {product.brand.name}
                      </div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition">
                        {product.name}
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer (WhatsApp CTA) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Enquire on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  )
}
