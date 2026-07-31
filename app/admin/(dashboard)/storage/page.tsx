import React from 'react'
import StorageMetricsClient from '@/components/admin/StorageMetricsClient'

export const metadata = {
  title: 'Storage & R2 Telemetry | Portal Admin',
  description: 'Realtime Cloudflare R2 bucket telemetry, object breakdown, and free-tier quota metrics.',
}

export default function AdminStoragePage() {
  return <StorageMetricsClient />
}
