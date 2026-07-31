import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import {
  Package,
  Layers,
  Wrench,
  Award,
  MapPin,
  ArrowRight,
  Plus,
  Store,
  ExternalLink,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, spareCount, brandCount, storeCount, recentProducts] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.spare.count(),
      prisma.brand.count(),
      prisma.storeLocation.count(),
      prisma.product.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { brand: true, category: true },
      }),
    ])

  const stats = [
    {
      label: 'Total Tools & Machinery',
      value: productCount,
      icon: Package,
      href: '/admin/products',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'Tool Categories',
      value: categoryCount,
      icon: Layers,
      href: '/admin/categories',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: 'Spare Parts & Accessories',
      value: spareCount,
      icon: Wrench,
      href: '/admin/spares',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Authorized Brands',
      value: brandCount,
      icon: Award,
      href: '/admin/brands',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      label: 'Store Locations & Coordinates',
      value: storeCount,
      icon: MapPin,
      href: '/admin/stores',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
  ]

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold mb-2">
            <Store className="w-3.5 h-3.5 text-amber-700" />
            <span>Ranigunj HQ • Secunderabad</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Inventory & Operations Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time overview of your wholesale tools, spares catalog, and branch coordinates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-extrabold px-5 py-3 rounded-xl shadow-md hover:shadow-slate-900/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Tool</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-sm font-bold px-4 py-3 rounded-xl shadow-sm flex items-center gap-2 transition"
          >
            <span>Live Site</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </div>
                <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition group-hover:scale-105 ${stat.color}`}
              >
                <Icon className="w-7 h-7" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Inventory Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Recently Added Machinery & Tools</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Latest items active in the Ranigunj Secunderabad wholesale inventory.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition"
          >
            <span>View All ({productCount})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700">No tools found in database</div>
            <div className="text-xs text-slate-500 mt-1">
              Add your first tool to get started.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4">Tool Name & Ref ID</th>
                  <th className="pb-3 px-4">Brand</th>
                  <th className="pb-3 px-4">Category</th>
                  <th className="pb-3 px-4">Featured</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      <div className="text-xs font-mono text-slate-400">{product.slug}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                        {product.brand.name}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-600 font-semibold">{product.category.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      {product.isFeatured ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300">
                          Featured
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Standard</span>
                      )}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1 transition"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
