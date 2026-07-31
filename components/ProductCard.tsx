import React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'
import { getWhatsAppInquiryUrl } from '@/lib/whatsapp'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    images: string
    brand: {
      name: string
      slug: string
      isCore?: boolean
    }
    category: {
      name: string
      slug: string
    }
  }
  primaryPhone?: string
}

export default function ProductCard({
  product,
  primaryPhone = '+91 98854 16452',
}: ProductCardProps) {
  let imageList: string[] = []
  try {
    imageList = JSON.parse(product.images)
  } catch {
    imageList = [product.images || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80']
  }
  const mainImage = imageList[0]

  const waUrl = getWhatsAppInquiryUrl({
    phone: primaryPhone,
    itemName: product.name,
    itemType: 'Product',
    itemSlug: product.slug,
    extraNotes: `Brand: ${product.brand.name} | Category: ${product.category.name}`,
  })

  return (
    <div className="glass-card bg-gradient-to-b from-white to-blue-50/20 rounded-2xl overflow-hidden flex flex-col group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-300">
      {/* Product Image Box */}
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={mainImage}
            alt={`${product.name} - ${product.brand.name} Wholesale Industrial Tool Dealer`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Top Brand Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Link
            href={`/brands/${product.brand.slug}`}
            className="bg-slate-900/90 hover:bg-slate-950 text-red-400 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-red-500/30 backdrop-blur-md shadow-sm transition"
          >
            {product.brand.name}
          </Link>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link href={`/products/${product.slug}`} className="block group/title">
            <h3 className="text-lg font-bold text-slate-900 group-hover/title:text-red-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Footer CTAs */}
        <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1"
          >
            <span>Specs & Spares</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Enquire on WhatsApp with prefilled message"
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl shadow-md hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition flex items-center justify-center"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>
    </div>
  )
}
