import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getContactSettings } from '@/lib/getSettings'
import StickyWhatsAppBar from '@/components/StickyWhatsAppBar'
import SpareDetailClient from '@/components/SpareDetailClient'
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
  const descText = `${spare.description || 'Authentic replacement part'} Stocked at our Flagship Showroom & Support Hub. Category: ${spare.spareCategory?.name || 'Uncategorized'}. Enquire on WhatsApp for immediate availability.`

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

  const relatedSpares = spare.spareCategoryId
    ? await prisma.spare.findMany({
        where: {
          spareCategoryId: spare.spareCategoryId,
          id: { not: spare.id },
        },
        include: {
          spareCategory: true,
        },
        orderBy: { name: 'asc' },
        take: 5,
      })
    : []

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-10 space-y-12 pb-24">
      <SpareDetailClient spare={spare} primaryPhone={settings.primaryPhone} />

      {relatedSpares.length > 0 && (
        <section className="border-t border-slate-200 pt-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-red-600">
                More in {spare.spareCategory?.name || 'Spare Parts'}
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Related Replacement Spare Parts
              </h2>
            </div>
            <Link href="/spares" className="text-xs font-extrabold text-red-600 hover:underline">
              Browse All Spares →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {relatedSpares.map((rs) => {
              let imgs: string[] = []
              try {
                imgs = JSON.parse(rs.images)
              } catch {
                imgs = [rs.images]
              }
              return (
                <Link
                  key={rs.id}
                  href={`/spares/${rs.slug}`}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-red-400 transition overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div className="h-44 bg-white border-b border-slate-100 flex items-center justify-center p-4">
                    <img
                      src={imgs[0]}
                      alt={rs.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-red-600">
                      {rs.spareCategory?.name || 'Spare Part'}
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition line-clamp-2">
                      {rs.name}
                    </div>
                    {rs.priceNote && (
                      <div className="text-[11px] text-slate-500 truncate">{rs.priceNote}</div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

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
