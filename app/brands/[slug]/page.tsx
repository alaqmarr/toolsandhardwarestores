import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Package, Wrench, ShieldCheck, Filter, Star, Award, CheckCircle } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getContactSettings } from '@/lib/getSettings'
import { queryProducts, DEFAULT_PAGE_SIZE } from '@/lib/catalogQueries'
import ProductCatalogClient from '@/components/ProductCatalogClient'
import ShareButton from '@/components/ShareButton'
import type { Metadata } from 'next'


interface BrandDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const brands = await prisma.brand.findMany({ select: { slug: true } })
  return brands.map((brand) => ({
    slug: brand.slug,
  }))
}

export async function generateMetadata({ params }: BrandDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = await prisma.brand.findUnique({
    where: { slug },
  })

  if (!brand) {
    return { title: 'Brand Not Found | Tools & Hardware Stores' }
  }

  const titleText = `${brand.name} Authorized Dealer & Wholesale Distributor | Tools & Hardware Stores`
  const descText = `${brand.description || `Authorized wholesale distributor for genuine ${brand.name} power tools, machinery, and accessories.`} Ready Stock & Store Counter Pickup Available in Secunderabad.`

  return {
    title: titleText,
    description: descText,
    openGraph: {
      title: titleText,
      description: descText,
      type: 'website',
      images: [
        {
          url: brand.image || 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Robert_Bosch_GmbH_logo.svg',
          width: 1200,
          height: 630,
          alt: brand.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descText,
      images: [brand.image || 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Robert_Bosch_GmbH_logo.svg'],
    },
  }
}

export default async function BrandDetailPage({
  params,
}: BrandDetailPageProps) {
  const { slug } = await params
  const settings = await getContactSettings()

  const brand = await prisma.brand.findUnique({
    where: { slug },
  })

  if (!brand) {
    notFound()
  }

  const [initialCatalog, brandCategories] = await Promise.all([
    queryProducts({ brand: brand.slug, page: 1, limit: DEFAULT_PAGE_SIZE, sort: 'featured' }),
    prisma.category.findMany({
      where: { products: { some: { brandId: brand.id } } },
      select: { name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-10 space-y-10 pb-24">
      {/* Breadcrumbs */}
      {/* Breadcrumb & Share Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-500 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-slate-900 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/brands" className="hover:text-slate-900 transition">
            Brands
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{brand.name}</span>
        </div>

        <ShareButton
          title={brand.name}
          text={`Explore ${brand.name} authorized industrial tools and machinery!`}
          buttonText="Share Brand"
        />
      </div>

      {/* Brand Hero Showcase Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Logo Showcase (Left) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <img
              src={
                brand.image ||
                'https://upload.wikimedia.org/wikipedia/commons/4/4b/Robert_Bosch_GmbH_logo.svg'
              }
              alt={brand.name}
              className="h-20 sm:h-24 w-auto object-contain mb-4"
            />
            {brand.isCore ? (
              <span className="bg-red-50 text-red-900 text-xs font-extrabold px-4 py-1.5 rounded-full border border-red-300 flex items-center gap-1.5 shadow-xs">
                <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                Authorized Major Distributor
              </span>
            ) : (
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-4 py-1.5 rounded-full border border-slate-300">
                Authorized Professional Partner
              </span>
            )}
          </div>

          {/* Description & Warranty Assurance (Right) */}
          <div className="md:col-span-8 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                <Award className="w-4 h-4 text-red-500" />
                <span>Authorized Stockist & Warranty Center</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
                {brand.name}
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
                {brand.description ||
                  `We supply authentic ${brand.name} power tools, heavy-duty machinery, and replacement spare parts. Backed by 35+ years of wholesale industrial distribution.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Genuine Factory Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
                <span>Manufacturer Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Wholesale GST Invoice Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Product List with Search & Pagination */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Available {brand.name} Tools & Equipment
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {initialCatalog.total} {initialCatalog.total === 1 ? 'Model' : 'Models'}
          </span>
        </div>

        <ProductCatalogClient
          initialItems={initialCatalog.items}
          initialTotal={initialCatalog.total}
          pageSize={DEFAULT_PAGE_SIZE}
          categories={brandCategories}
          lockedBrandSlug={brand.slug}
          primaryPhone={settings.primaryPhone}
        />
      </div>

      {/* Back CTA */}
      <div className="pt-8 flex items-center justify-between border-t border-slate-200">
        <Link
          href="/brands"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-red-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Authorized Brands</span>
        </Link>
        <Link
          href="/contact"
          className="bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition shadow-sm"
        >
          Inquire Wholesale Pricing →
        </Link>
      </div>
    </div>
  )
}
