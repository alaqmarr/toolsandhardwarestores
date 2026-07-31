import React from 'react'
import { prisma } from '@/lib/db'
import SettingsAdminClient from '@/components/admin/SettingsAdminClient'

export const metadata = {
  title: 'Global Store Settings | Ranigunj HQ Portal',
  description: 'Configure WhatsApp contact numbers, Gmail SMTP mailer credentials, and R2 cloud storage keys.',
}

export default async function AdminSettingsPage() {
  const settings = await prisma.contactSetting.findUnique({
    where: { id: 'settings-main' },
  })

  return <SettingsAdminClient settings={settings} />
}
