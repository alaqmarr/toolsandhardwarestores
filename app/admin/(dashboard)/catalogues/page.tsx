import React from 'react'
import CataloguesAdminClient from '@/components/admin/CataloguesAdminClient'

export const metadata = {
  title: 'Catalogues & Brochures | Portal Admin',
  description: 'Manage and upload industrial catalogues and technical brochures for public download.',
}

export default function AdminCataloguesPage() {
  return <CataloguesAdminClient />
}
