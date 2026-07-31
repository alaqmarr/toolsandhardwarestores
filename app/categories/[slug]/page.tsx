import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Package, Wrench, ShieldCheck, Filter } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getContactSettings } from '@/lib/getSettings'
import ProductCard from '@/components/ProductCard'
import ShareButton from '@/components/ShareButton'
import type { Metadata } from 'next'

export const revalidate = 3600 // SSG ISR revalidation

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  })
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

interface CategoryDetailPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    brand?: string
  }>
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
  searchParams,
}: CategoryDetailPageProps) {
  const { slug } = await params
  const { brand: selectedBrandSlug } = await searchParams
  const settings = await getContactSettings()

  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    notFound()
  }

  // Fetch all brands that have products in this category
  const brandsInCategory = await prisma.brand.findMany({
    where: {
      products: {
        some: { categoryId: category.id },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Build product filter where clause
  const whereClause: any = { categoryId: category.id }
  if (selectedBrandSlug) {
    const matchedBrand = brandsInCategory.find((b) => b.slug === selectedBrandSlug)
    if (matchedBrand) {
      whereClause.brandId = matchedBrand.id
    }
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      brand: true,
      category: true,
    },
    orderBy: { name: 'asc' },
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

      {/* Brand Filter Tabs */}
      {brandsInCategory.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-red-500" />
            <span>Filter by Brand:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/categories/${category.slug}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                !selectedBrandSlug
                  ? 'bg-red-50 text-red-900 border-red-300 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              All Brands ({products.length})
            </Link>

            {brandsInCategory.map((brand) => {
              const isSelected = selectedBrandSlug === brand.slug
              return (
                <Link
                  key={brand.id}
                  href={`/categories/${category.slug}?brand=${brand.slug}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-red-50 text-red-900 border-red-300 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <span>{brand.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No products found</h3>
          <p className="text-sm text-slate-600">
            No items match the selected brand filter in this category. Try selecting &quot;All
            Brands&quot;.
          </p>
          <Link
            href={`/categories/${category.slug}`}
            className="inline-block mt-2 text-xs font-bold text-red-600 hover:underline"
          >
            Clear brand filter
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              primaryPhone={settings.primaryPhone}
            />
          ))}
        </div>
      )}
    </div>
  )
}
