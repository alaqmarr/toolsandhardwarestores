import React from 'react'
import { prisma } from '@/lib/db'
import SparesAdminClient from '@/components/admin/SparesAdminClient'

export const metadata = {
  title: 'Spare Parts Management | Ranigunj HQ Portal',
  description: 'Manage industrial tool spares, wholesale pricing notes, and tool compatibility.',
}

export default async function AdminSparesPage() {
  const [spares, categories, products] = await Promise.all([
    prisma.spare.findMany({
      include: {
        spareCategory: true,
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.spareCategory.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <SparesAdminClient
      spares={spares}
      categories={categories}
      products={products}
    />
  )
}
