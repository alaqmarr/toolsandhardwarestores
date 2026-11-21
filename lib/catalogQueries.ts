import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const DEFAULT_PAGE_SIZE = 24
export const MAX_PAGE_SIZE = 60

export interface ProductQueryParams {
  q?: string
  brand?: string
  category?: string
  sort?: string
  page?: number
  limit?: number
}

export interface SpareQueryParams {
  q?: string
  topCat?: string
  subCat?: string
  page?: number
  limit?: number
}

function clampPage(page?: number): number {
  if (!page || Number.isNaN(page) || page < 1) return 1
  return Math.floor(page)
}

function clampLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit) || limit < 1) return DEFAULT_PAGE_SIZE
  return Math.min(Math.floor(limit), MAX_PAGE_SIZE)
}

export async function queryProducts(params: ProductQueryParams) {
  const page = clampPage(params.page)
  const limit = clampLimit(params.limit)
  const q = params.q?.trim() || ''
  const brand = params.brand?.trim() || ''
  const category = params.category?.trim() || ''
  const sort = params.sort || 'featured'

  const andClauses: Prisma.ProductWhereInput[] = []

  if (brand && brand !== 'ALL') {
    andClauses.push({ brand: { slug: brand } })
  }

  if (category && category !== 'ALL') {
    andClauses.push({ category: { slug: category } })
  }

  if (q) {
    const tokens = q.split(/\s+/).filter(Boolean).slice(0, 8)
    for (const token of tokens) {
      andClauses.push({
        OR: [
          { name: { contains: token } },
          { slug: { contains: token } },
          { description: { contains: token } },
          { features: { contains: token } },
          { specifications: { contains: token } },
          { brand: { name: { contains: token } } },
          { category: { name: { contains: token } } },
        ],
      })
    }
  }

  const where: Prisma.ProductWhereInput = andClauses.length > 0 ? { AND: andClauses } : {}

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === 'name-asc'
      ? [{ name: 'asc' }]
      : sort === 'name-desc'
        ? [{ name: 'desc' }]
        : [{ isFeatured: 'desc' }, { name: 'asc' }]

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        brand: { select: { id: true, name: true, slug: true, isCore: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    items,
    total,
    page: Math.min(page, totalPages),
    limit,
    totalPages,
  }
}

export async function querySpares(params: SpareQueryParams) {
  const page = clampPage(params.page)
  const limit = clampLimit(params.limit)
  const q = params.q?.trim() || ''
  const topCat = params.topCat?.trim() || ''
  const subCat = params.subCat?.trim() || ''

  const andClauses: Prisma.SpareWhereInput[] = []

  if (subCat) {
    andClauses.push({ spareCategoryId: subCat })
  } else if (topCat) {
    andClauses.push({
      OR: [
        { spareCategoryId: topCat },
        { spareCategory: { parentId: topCat } },
      ],
    })
  }

  if (q) {
    const tokens = q.split(/\s+/).filter(Boolean).slice(0, 8)
    for (const token of tokens) {
      andClauses.push({
        OR: [
          { name: { contains: token } },
          { slug: { contains: token } },
          { description: { contains: token } },
          { priceNote: { contains: token } },
          { spareCategory: { name: { contains: token } } },
          {
            products: {
              some: {
                product: {
                  OR: [
                    { name: { contains: token } },
                    { brand: { name: { contains: token } } },
                  ],
                },
              },
            },
          },
        ],
      })
    }
  }

  const where: Prisma.SpareWhereInput = andClauses.length > 0 ? { AND: andClauses } : {}

  const [total, items] = await Promise.all([
    prisma.spare.count({ where }),
    prisma.spare.findMany({
      where,
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
                brand: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    items,
    total,
    page: Math.min(page, totalPages),
    limit,
    totalPages,
  }
}
