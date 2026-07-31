import React from 'react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import SetupClient from '@/components/SetupClient'

export const metadata = {
  title: 'Portal Initial Setup | Tools & Hardware Stores (Ranigunj HQ)',
  description: 'First-time administrator setup for Tools & Hardware Stores Ranigunj Secunderabad management portal.',
}

export default async function SetupPage() {
  const adminCount = await prisma.admin.count()

  // If any admin already exists, permanently lock /setup and redirect to login
  if (adminCount > 0) {
    redirect('/admin/login')
  }

  return <SetupClient />
}
