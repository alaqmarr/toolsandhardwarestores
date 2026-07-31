import React from 'react'
import type { Metadata } from 'next'
import ResourcesClient from '@/components/ResourcesClient'

export const metadata: Metadata = {
  title: 'Technical Resources & Catalogues | Tools & Hardware Stores',
  description:
    'Download official industrial power tool master catalogues, spare part armature cross-reference guides, and heavy machinery technical brochures.',
}

export default function ResourcesPage() {
  return <ResourcesClient />
}
