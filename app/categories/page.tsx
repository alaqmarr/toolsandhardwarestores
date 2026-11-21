import React from 'react'
import Link from 'next/link'
import { ArrowRight, Wrench, Package, ShieldCheck } from 'lucide-react'
import { prisma } from '@/lib/db'

export const revalidate = 60

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-12 space-y-12 pb-24">
      {/* Header */}
      <div className="border-b border-slate-200 pb-8 space-y-3">
        <div className="text-xs font-black text-red-600 uppercase tracking-widest">
          Wholesale & Retail Tool Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Industrial Tool & Equipment Categories
        </h1>
        <p className="text-slate-600 max-w-2xl text-sm sm:text-base">
          Browse our wholesale and retail inventory of power tools, cordless systems, diamond blades,
          agriculture machinery, and accessories. Click any category to explore models from Powerbilt,
          DongCheng, Bosch, Checkmate, Tewort, Powermatic, and Iron King.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="bg-white rounded-2xl overflow-hidden group flex flex-col border border-slate-200 hover:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="relative h-56 overflow-hidden bg-white border-b border-slate-100 flex items-center justify-center p-4">
              <img
                src={
                  cat.image ||
                  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'
                }
                alt={cat.name}
                loading="lazy"
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />

              {/* Product Count Badge */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white text-xs font-bold px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 shadow-sm">
                <Package className="w-3.5 h-3.5 text-red-400" />
                <span>{cat._count.products} Models Available</span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4 bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition">
                  {cat.name}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-red-600">
                <span>View Products in {cat.name}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>
        ))}

        {/* Dedicated Spares Card */}
        <Link
          href="/spares"
          className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl overflow-hidden group flex flex-col border-2 border-dashed border-red-300 hover:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <div className="relative h-56 overflow-hidden bg-red-100/50 flex items-center justify-center p-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-400 flex items-center justify-center mx-auto">
                <Wrench className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-sm font-black text-slate-900 uppercase tracking-wider">
                100% Genuine Spare Parts
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-red-700 transition">
                Armatures, Rotors & Universal Carbon Brushes
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Explore our comprehensive spares inventory with subcategories and compatible tool
                fitments for Powerbilt, Checkmate, Tewort, Powermatic, and compatible power tools.
              </p>
            </div>

            <div className="pt-4 border-t border-red-200/60 flex items-center justify-between text-xs font-extrabold text-red-700">
              <span>Explore Spares Directory</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
