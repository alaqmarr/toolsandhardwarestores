import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Wrench, ShieldCheck, Tag, CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getContactSettings } from '@/lib/getSettings'
import StickyWhatsAppBar from '@/components/StickyWhatsAppBar'
import WhatsAppIcon from '@/components/WhatsAppIcon'
import ShareButton from '@/components/ShareButton'
import { getWhatsAppInquiryUrl } from '@/lib/whatsapp'
import type { Metadata } from 'next'

export const revalidate = 3600 // SSG ISR revalidation

export async function generateStaticParams() {
  const spares = await prisma.spare.findMany({
    select: { slug: true },
  })
  return spares.map((spare) => ({
    slug: spare.slug,
  }))
}

interface SpareDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: SpareDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const spare = await prisma.spare.findUnique({
    where: { slug },
    include: { spareCategory: true },
  })

  if (!spare) {
    return { title: 'Spare Part Not Found | Tools & Hardware Stores' }
  }

  let imageList: string[] = []
  try {
    imageList = JSON.parse(spare.images)
  } catch {
    imageList = [spare.images]
  }
  const mainImg = imageList[0]

  const titleText = `${spare.name} | Genuine Spare Part - Industrial Tool Specialists`
  const descText = `${spare.description || 'Authentic replacement part'} Stocked at our Flagship Showroom & Support Hub. Category: ${spare.spareCategory.name}. Enquire on WhatsApp for immediate availability.`

  return {
    title: titleText,
    description: descText,
    openGraph: {
      title: titleText,
      description: descText,
      type: 'website',
      images: [
        {
          url: mainImg,
          width: 1200,
          height: 630,
          alt: spare.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descText,
      images: [mainImg],
    },
  }
}

export default async function SpareDetailPage({ params }: SpareDetailPageProps) {
  const { slug } = await params
  const settings = await getContactSettings()

  const spare = await prisma.spare.findUnique({
    where: { slug },
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
              category: true,
            },
          },
        },
      },
    },
  })

  if (!spare) {
    notFound()
  }

  let imageList: string[] = []
  try {
    imageList = JSON.parse(spare.images)
  } catch {
    imageList = [spare.images]
  }
  const mainImg = imageList[0]

  const waUrl = getWhatsAppInquiryUrl({
    phone: settings.primaryPhone,
    itemName: spare.name,
    itemType: 'Spare Part',
    itemSlug: spare.slug,
    extraNotes: `Category: ${
      spare.spareCategory.parent ? `${spare.spareCategory.parent.name} -> ` : ''
    }${spare.spareCategory.name}`,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24">
      {/* Breadcrumbs & Share Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-500 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-slate-900 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/spares" className="hover:text-slate-900 transition">
            Spares
          </Link>
          <span>/</span>
          <span className="text-red-600 font-bold truncate">{spare.name}</span>
        </div>

        <ShareButton
          title={spare.name}
          text={`Check out ${spare.name} at Tools & Hardware Stores!`}
          buttonText="Share Spare"
        />
      </div>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative shadow-lg">
            <img
              src={mainImg}
              alt={spare.name}
              className="max-h-full max-w-full object-contain p-4"
            />
          </div>
        </div>

        {/* Right Info */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="text-xs font-extrabold text-red-600 uppercase tracking-wider">
              {spare.spareCategory.parent ? `${spare.spareCategory.parent.name} • ` : ''}
              {spare.spareCategory.name}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {spare.name}
            </h1>
            <p className="text-base text-slate-700 leading-relaxed">
              {spare.description || 'Industrial replacement spare available for immediate dispatch.'}
            </p>
          </div>

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
          </div>
        </div>
      </div>

      {/* Compatible Tools Grid */}
      <div className="border-t border-slate-200 pt-10 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-red-500" />
          <span>Compatible Power Tools & Equipment ({spare.products.length})</span>
        </h2>

        {spare.products.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            Universal spare part - contact us on WhatsApp to verify compatibility for your specific model.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spare.products.map(({ product }) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-red-400 transition flex items-center justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="text-xs text-red-600 font-bold uppercase">
                    {product.brand.name}
                  </div>
                  <div className="text-base font-bold text-slate-900 group-hover:text-red-600 transition">
                    {product.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {product.category.name}
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <StickyWhatsAppBar
        primaryPhone={settings.primaryPhone}
        itemName={spare.name}
        itemType="Spare Part"
        itemSlug={spare.slug}
        priceText={spare.priceNote || 'In Stock'}
      />
    </div>
  )
}
