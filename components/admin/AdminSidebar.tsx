'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Layers,
  Wrench,
  Award,
  MapPin,
  Settings,
  Store,
  ExternalLink,
  UserCheck,
  Database,
  BookOpen,
} from 'lucide-react'
import AdminLogoutButton from './AdminLogoutButton'

interface AdminSidebarProps {
  adminName: string
  adminEmail: string
}

export default function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Spare Parts', href: '/admin/spares', icon: Wrench },
    { label: 'Brands', href: '/admin/brands', icon: Award },
    { label: 'Store Locations', href: '/admin/stores', icon: MapPin },
    { label: 'Catalogues', href: '/admin/catalogues', icon: BookOpen },
    { label: 'Storage & R2 Metrics', href: '/admin/storage', icon: Database },
    { label: 'Portal Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-red-400 flex items-center justify-center font-black text-lg shadow-sm shrink-0">
            TH
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-slate-900 tracking-tight truncate">
              Tools & Hardware
            </div>
            <div className="text-[11px] font-extrabold text-red-600 uppercase tracking-wider">
              Control Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-2">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive
                  ? 'bg-slate-900 text-red-400 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <div className="pt-4 pb-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-2">
            Public Website
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4 text-slate-400" />
              <span>View Storefront</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate">{adminName}</div>
            <div className="text-[10px] text-slate-500 truncate">{adminEmail}</div>
          </div>
        </div>
        <AdminLogoutButton />
      </div>
    </aside>
  )
}
