import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getContactSettings } from '@/lib/getSettings'
import ProductDetailClient from '@/components/ProductDetailClient'
import ProductCard from '@/components/ProductCard'
import StickyWhatsAppBar from '@/components/StickyWhatsAppBar'
import type { Metadata } from 'next'

export const revalidate = 3600 // SSG ISR revalidation

// Static Site Generation for all product slugs
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
  })
  return products.map((product) => ({
    slug: product.slug,
  }))
}

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true, category: true },
  })

  if (!product) {
    return { title: 'Product Not Found | Tools & Hardware Stores' }
  }

  let imageList: string[] = []
  try {
    imageList = JSON.parse(product.images)
  } catch {
    imageList = [product.images || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80']
  }
  const mainImage = imageList[0]

  const titleText = `${product.name} | ${product.brand.name} Wholesale Dealer - Secunderabad`
  const descText = `${product.description} Available at Victoria Ranigunj HQ, Secunderabad. Major distributors for ${product.brand.name}. Enquire on WhatsApp for instant wholesale quotation.`

  return {
    title: titleText,
    description: descText,
    openGraph: {
      title: titleText,
      description: descText,
      type: 'website',
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descText,
      images: [mainImage],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const settings = await getContactSettings()

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      spares: {
        include: {
          spare: {
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
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: {
      brand: true,
      category: true,
    },
    orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
    take: 5,
  })

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-10 pb-24 space-y-12">
      <ProductDetailClient
        product={product}
        primaryPhone={settings.primaryPhone}
      />

      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-red-600">
                More in {product.category.name}
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Related Tools & Equipment
              </h2>
            </div>
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-xs font-extrabold text-red-600 hover:underline"
            >
              View All in {product.category.name} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                primaryPhone={settings.primaryPhone}
              />
            ))}
          </div>
        </section>
      )}

      <StickyWhatsAppBar
        primaryPhone={settings.primaryPhone}
        itemName={product.name}
        itemType="Product"
        itemSlug={product.slug}
      />
    </div>
  )
}
