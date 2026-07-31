import React from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Portal Management | Tools & Hardware Stores',
  description: 'Manage products, categories, spare parts, brands, and store locations.',
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // Require valid JWT admin session
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar
        adminName={session.name || 'Administrator'}
        adminEmail={session.email || 'admin@toolsandhardwarestores.com'}
      />
      <main className="flex-1 min-w-0 overflow-y-auto p-6 sm:p-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
