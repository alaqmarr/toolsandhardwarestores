import React from 'react'
import { prisma } from '@/lib/db'
import CategoriesAdminClient from '@/components/admin/CategoriesAdminClient'

export const metadata = {
  title: 'Tool Categories Management | Ranigunj HQ Portal',
  description: 'Manage wholesale tool categories, banners, descriptions, and featured status.',
}

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
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

  return <CategoriesAdminClient categories={categories} />
}
