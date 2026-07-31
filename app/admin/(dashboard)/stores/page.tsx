import React from 'react'
import { prisma } from '@/lib/db'
import StoresAdminClient from '@/components/admin/StoresAdminClient'

export const metadata = {
  title: 'Store Locations & GPS Management | Ranigunj HQ Portal',
  description: 'Manage store coordinates, addresses, and closest-store distance routing.',
}

export default async function AdminStoresPage() {
  const stores = await prisma.storeLocation.findMany({
    orderBy: {
      isPrimary: 'desc',
    },
  })

  return <StoresAdminClient stores={stores} />
}
