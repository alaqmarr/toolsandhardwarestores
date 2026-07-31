'use client'

import React from 'react'
import WhatsAppIcon from './WhatsAppIcon'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import { getWhatsAppInquiryUrl } from '@/lib/whatsapp'

interface StickyWhatsAppBarProps {
  primaryPhone: string
  itemName: string
  itemType: 'Product' | 'Spare Part' | 'General Consultation'
  itemSlug?: string
  priceText?: string
}

export default function StickyWhatsAppBar({
  primaryPhone,
  itemName,
  itemType,
  itemSlug,
  priceText = 'Wholesale & Retail Best Price',
}: StickyWhatsAppBarProps) {
  const waUrl = getWhatsAppInquiryUrl({
    phone: primaryPhone,
    itemName,
    itemType,
    itemSlug,
    extraNotes: 'Requesting immediate stock status and wholesale dealer quotation.',
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-3 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Item summary */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {itemType} Reference
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Industrial Dealer</span>
            </span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate mt-0.5">
            {itemName}
          </div>
        </div>

        {/* Action button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 sm:px-7 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition flex items-center gap-2 shrink-0"
        >
          <WhatsAppIcon className="w-5 h-5 text-white" />
          <span className="text-xs sm:text-sm">Enquire on WhatsApp</span>
          <ArrowRight className="w-4 h-4 hidden sm:block" />
        </a>
      </div>
    </div>
  )
}
