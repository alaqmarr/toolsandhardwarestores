import React from 'react'
import { prisma } from '@/lib/db'
import ProductsAdminClient from '@/components/admin/ProductsAdminClient'

export const metadata = {
  title: 'Tools & Machinery Management | Ranigunj HQ Portal',
  description: 'Manage wholesale tools inventory, images, features, and linked spares.',
}

export default async function AdminProductsPage() {
  const [products, brands, categories, spares] = await Promise.all([
    prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        spares: {
          include: {
            spare: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.brand.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.spare.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <ProductsAdminClient
      products={products}
      brands={brands}
      categories={categories}
      spares={spares}
    />
  )
}
