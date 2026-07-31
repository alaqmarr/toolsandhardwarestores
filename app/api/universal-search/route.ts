import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export const revalidate = 60 // Cache for 60 seconds
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qParam = searchParams.get('q')?.trim().toLowerCase() || ''

    const [products, spares, brands, categories, catalogues] = await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          features: true,
          images: true,
          brand: { select: { name: true, description: true } },
          category: { select: { name: true, description: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.spare.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          priceNote: true,
          spareCategory: { select: { name: true, description: true } },
          images: true,
          products: {
            select: {
              product: {
                select: {
                  name: true,
                  brand: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.brand.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          isCore: true,
          products: {
            select: { name: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          products: {
            select: { name: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.resourceCatalogue.findMany({
        select: {
          id: true,
          title: true,
          category: true,
          description: true,
          fileType: true,
          fileUrl: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const items: Array<{
      id: string
      title: string
      subtitle: string
      url: string
      type: 'Product' | 'Spare Part' | 'Brand' | 'Category' | 'Catalogue'
      badge?: string
      image?: string
      searchableText: string
    }> = []

    // Map Products
    products.forEach((p) => {
      let firstImage = ''
      try {
        const parsed = JSON.parse(p.images)
        if (Array.isArray(parsed) && parsed.length > 0) {
          firstImage = parsed[0]
        }
      } catch {
        firstImage = p.images
      }

      const searchableText = [
        p.name,
        p.slug,
        p.brand?.name || '',
        p.brand?.description || '',
        p.category?.name || '',
        p.category?.description || '',
        p.description || '',
        p.features || '',
      ]
        .join(' ')
        .toLowerCase()

      items.push({
        id: `prod-${p.id}`,
        title: p.name,
        subtitle: `${p.brand?.name || 'Industrial'} • ${p.category?.name || 'Tools'}`,
        url: `/products/${p.slug}`,
        type: 'Product',
        badge: p.brand?.name,
        image: firstImage || undefined,
        searchableText,
      })
    })

    // Map Spare Parts
    spares.forEach((s) => {
      let firstImage = ''
      try {
        const parsed = JSON.parse(s.images)
        if (Array.isArray(parsed) && parsed.length > 0) {
          firstImage = parsed[0]
        }
      } catch {
        firstImage = s.images
      }

      const compatibleToolsText = s.products
        .map((x) => `${x.product.name} ${x.product.brand?.name || ''}`)
        .join(' ')

      const searchableText = [
        s.name,
        s.slug,
        s.spareCategory?.name || '',
        s.spareCategory?.description || '',
        s.description || '',
        s.priceNote || '',
        compatibleToolsText,
        'spare part armature brush carbon rotor stator maintenance accessory',
      ]
        .join(' ')
        .toLowerCase()

      items.push({
        id: `spare-${s.id}`,
        title: s.name,
        subtitle: `Genuine Spare • ${s.spareCategory?.name || 'Part'}`,
        url: `/spares/${s.slug}`,
        type: 'Spare Part',
        badge: 'GENUINE SPARE',
        image: firstImage || undefined,
        searchableText,
      })
    })

    // Map Brands
    brands.forEach((b) => {
      const brandProductsText = b.products.map((x) => x.name).join(' ')
      const searchableText = [
        b.name,
        b.slug,
        b.description || '',
        b.isCore ? 'core distributor authorized flagship dealer' : 'authorized partner dealer',
        brandProductsText,
        'brand manufacturer',
      ]
        .join(' ')
        .toLowerCase()

      items.push({
        id: `brand-${b.id}`,
        title: b.name,
        subtitle: b.isCore ? '★ Authorized Core Distributor' : 'Authorized Brand Partner',
        url: `/products?brand=${b.slug}`,
        type: 'Brand',
        badge: 'BRAND',
        searchableText,
      })
    })

    // Map Categories
    categories.forEach((c) => {
      const catProductsText = c.products.map((x) => x.name).join(' ')
      const searchableText = [
        c.name,
        c.slug,
        c.description || '',
        catProductsText,
        'category tools machinery equipment',
      ]
        .join(' ')
        .toLowerCase()

      items.push({
        id: `cat-${c.id}`,
        title: c.name,
        subtitle: 'Explore full catalog range in this category',
        url: `/products?category=${c.slug}`,
        type: 'Category',
        badge: 'CATEGORY',
        searchableText,
      })
    })

    // Map Catalogues
    catalogues.forEach((cat) => {
      const searchableText = [
        cat.title,
        cat.category,
        cat.description || '',
        cat.fileType || '',
        'catalogue catalog manual specification pdf download technical resource',
      ]
        .join(' ')
        .toLowerCase()

      items.push({
        id: `cat-res-${cat.id}`,
        title: cat.title,
        subtitle: `${cat.category} • Official Technical ${cat.fileType || 'PDF'}`,
        url: `/resources`,
        type: 'Catalogue',
        badge: 'RESOURCE',
        searchableText,
      })
    })

    // If query parameter is passed, filter using token-based matching across searchableText
    if (qParam) {
      const tokens = qParam.split(/\s+/).filter(Boolean)
      const filtered = items.filter((item) => {
        return tokens.every((token) => item.searchableText.includes(token))
      })
      return NextResponse.json(filtered, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      })
    }

    return NextResponse.json(items, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error: any) {
    console.error('Universal search error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch universal search index' },
      { status: 500 }
    )
  }
}

