import React from 'react'
import { prisma } from '@/lib/db'
import BrandsAdminClient from '@/components/admin/BrandsAdminClient'

export const metadata = {
  title: 'Authorized Brands Management | Ranigunj HQ Portal',
  description: 'Manage core distributors, specialty manufacturing partners, and brand logos.',
}

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return <BrandsAdminClient brands={brands} />
}
