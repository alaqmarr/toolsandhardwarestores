import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Package, Wrench, ShieldCheck, Filter } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getContactSettings } from '@/lib/getSettings'
import { queryProducts, DEFAULT_PAGE_SIZE } from '@/lib/catalogQueries'
import ProductCatalogClient from '@/components/ProductCatalogClient'
import ShareButton from '@/components/ShareButton'
import type { Metadata } from 'next'



interface CategoryDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } })
  return categories.map((cat) => ({
    slug: cat.slug,
  }))
}

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    return { title: 'Category Not Found | Tools & Hardware Stores' }
  }

  const titleText = `${category.name} | Industrial Power Tools - Worldwide Industrial Dealer`
  const descText = `${category.description || 'Comprehensive industrial tool inventory'} Stocked & Ready for Dispatch. Major distributors for Bosch, DeWalt, Hitachi, Makita.`

  return {
    title: titleText,
    description: descText,
    openGraph: {
      title: titleText,
      description: descText,
      type: 'website',
      images: [
        {
          url: category.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descText,
      images: [category.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'],
    },
  }
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { slug } = await params
  const settings = await getContactSettings()

  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    notFound()
  }

  const [initialCatalog, categoryBrands] = await Promise.all([
    queryProducts({ category: category.slug, page: 1, limit: DEFAULT_PAGE_SIZE, sort: 'featured' }),
    prisma.brand.findMany({
      where: { products: { some: { categoryId: category.id } } },
      select: { name: true, slug: true },
      orderBy: [{ isCore: 'desc' }, { name: 'asc' }],
    }),
  ])

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-10 space-y-10 pb-24">
      {/* Breadcrumbs & Share Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-500 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-slate-900 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-slate-900 transition">
            Categories
          </Link>
          <span>/</span>
          <span className="text-red-600 font-bold">{category.name}</span>
        </div>

        <ShareButton
          title={category.name}
          text={`Explore ${category.name} industrial power tools and machinery!`}
          buttonText="Share Category"
        />
      </div>

      {/* Category Header Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">
              <Package className="w-4 h-4" />
              <span>Industrial Tools & Equipment</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              {category.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {category.description}
            </p>
          </div>

          <Link
            href="/categories"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-5 py-3 rounded-xl border border-slate-300 transition flex items-center gap-2 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Categories</span>
          </Link>
        </div>
      </div>



      {/* Search, Brand Filter & Paginated Product Grid */}
      <ProductCatalogClient
        initialItems={initialCatalog.items}
        initialTotal={initialCatalog.total}
        pageSize={DEFAULT_PAGE_SIZE}
        brands={categoryBrands}
        lockedCategorySlug={category.slug}
        primaryPhone={settings.primaryPhone}
      />
    </div>
  )
}
