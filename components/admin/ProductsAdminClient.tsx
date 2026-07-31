'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Award,
  Layers,
  Wrench,
  Check,
  X,
  Sparkles,
  Video,
} from 'lucide-react'
import ReactDropzoneUploader from '@/components/ReactDropzoneUploader'
import ConfirmDialog from './ConfirmDialog'

interface BrandItem {
  id: string
  name: string
  slug: string
}

interface CategoryItem {
  id: string
  name: string
  slug: string
}

interface SpareItem {
  id: string
  name: string
  slug: string
}

interface ProductItem {
  id: string
  name: string
  slug: string
  description: string
  features: string | null
  images: string
  videoUrl: string | null
  isFeatured: boolean
  brandId: string
  categoryId: string
  brand: BrandItem
  category: CategoryItem
  spares: Array<{
    spare: SpareItem
  }>
}

interface ProductsAdminClientProps {
  products: ProductItem[]
  brands: BrandItem[]
  categories: CategoryItem[]
  spares: SpareItem[]
}

export default function ProductsAdminClient({
  products: initialProducts,
  brands,
  categories,
  spares,
}: ProductsAdminClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState<ProductItem[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [brandId, setBrandId] = useState(brands[0]?.id || '')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [description, setDescription] = useState('')
  const [featuresText, setFeaturesText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [selectedSpareIds, setSelectedSpareIds] = useState<string[]>([])

  const openNewModal = () => {
    setEditingProduct(null)
    setName('')
    setBrandId(brands[0]?.id || '')
    setCategoryId(categories[0]?.id || '')
    setDescription('')
    setFeaturesText('')
    setImageUrl('')
    setVideoUrl('')
    setIsFeatured(false)
    setSelectedSpareIds([])
    setIsModalOpen(true)
  }

  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p)
    setName(p.name)
    setBrandId(p.brandId)
    setCategoryId(p.categoryId)
    setDescription(p.description)

    let parsedFeatures: string[] = []
    try {
      if (p.features) parsedFeatures = JSON.parse(p.features)
    } catch {
      parsedFeatures = []
    }
    setFeaturesText(parsedFeatures.join('\n'))

    setImageUrl(p.images)
    setVideoUrl(p.videoUrl || '')
    setIsFeatured(p.isFeatured)
    setSelectedSpareIds(p.spares.map((s) => s.spare.id))
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleToggleSpare = (spareId: string) => {
    setSelectedSpareIds((prev) =>
      prev.includes(spareId) ? prev.filter((id) => id !== spareId) : [...prev, spareId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !brandId || !categoryId || !description) {
      toast.error('Please complete all required fields.')
      return
    }

    setLoading(true)
    const toastId = toast.loading(
      editingProduct ? 'Updating tool catalog item...' : 'Creating new tool catalog item...'
    )

    // Convert features text lines to JSON array
    const featuresArray = featuresText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    const payload = {
      name,
      brandId,
      categoryId,
      description,
      features: featuresArray,
      images:
        imageUrl ||
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop',
      videoUrl: videoUrl || null,
      isFeatured,
      spareIds: selectedSpareIds,
    }

    try {
      const endpoint = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product')
      }

      toast.success(editingProduct ? 'Tool updated successfully!' : 'Tool created successfully!', {
        id: toastId,
      })
      closeModal()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Error saving product', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return
    }

    const toastId = toast.loading('Deleting product...')
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deletion failed')

      toast.success('Product deleted from inventory.', { id: toastId })
      setProducts((prev) => prev.filter((p) => p.id !== id))
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product', { id: toastId })
    }
  }

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesBrand = selectedBrand === 'ALL' || p.brandId === selectedBrand
      const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory

      return matchesSearch && matchesBrand && matchesCategory
    })
  }, [products, searchQuery, selectedBrand, selectedCategory])

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)))
    }
  }

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true)
    const toastId = toast.loading('Deleting selected products...')
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Bulk deletion failed')

      toast.success(data.message || 'Products deleted successfully.', { id: toastId })
      setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)))
      setSelectedIds(new Set())
      setIsBulkDeleteModalOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete products', { id: toastId })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-8 h-8 text-amber-600" />
            <span>Tools & Machinery Catalog</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage wholesale power tools, heavy industrial machinery, images, and compatible spares.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-3.5 rounded-2xl shadow-md hover:shadow-slate-900/20 flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5 text-amber-400" />
          <span>Add New Tool</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, or brand..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
            />
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-700 bg-white outline-none transition"
            >
              <option value="ALL">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-700 bg-white outline-none transition"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <div>
            Showing <span className="text-slate-900 font-extrabold">{filteredProducts.length}</span>{' '}
            of {products.length} products
          </div>
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl border border-red-200 transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          )}
          {(selectedBrand !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedBrand('ALL')
                setSelectedCategory('ALL')
              }}
              className="text-amber-700 hover:text-amber-800 underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-base font-bold text-slate-800">No tools match your filter</div>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search keywords or category selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 pl-6 pr-2 w-12">
                    <input
                      type="checkbox"
                      checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                  </th>
                  <th className="py-4 px-4">Tool Details & Media</th>
                  <th className="py-4 px-4">Brand</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Linked Spares</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50/80 transition ${selectedIds.has(item.id) ? 'bg-slate-50' : ''}`}>
                    <td className="py-4 pl-6 pr-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-12 h-12 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0">
                          {(() => {
                            let imgUrl = ''
                            try {
                              const parsed = JSON.parse(item.images)
                              imgUrl = Array.isArray(parsed) ? (parsed[0] || '') : String(parsed || '')
                            } catch {
                              imgUrl = item.images || ''
                            }
                            return (
                              <img
                                src={imgUrl}
                                alt={item.name}
                                className="w-full h-full object-contain p-1"
                              />
                            )
                          })()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 truncate">{item.name}</div>
                          <div className="text-xs font-mono text-slate-400 truncate">
                            {item.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-extrabold">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>{item.brand.name}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/50 text-xs font-bold">
                        <Layers className="w-3 h-3 text-amber-700" />
                        <span>{item.category.name}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                        <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.spares.length} Spares Linked</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {item.isFeatured ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          <span>Featured</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="py-4 pl-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/products/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview Storefront"
                          className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          title="Edit Tool"
                          className="p-2 rounded-xl text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Delete Tool"
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingProduct ? 'Edit Tool Item' : 'Add New Tool to Inventory'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure specifications, image URL/upload, and linked spare parts.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tool Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tool Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bosch GSB 600 Professional Impact Drill"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              {/* Brand & Category Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Brand *
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-800 bg-white outline-none transition"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-800 bg-white outline-none transition"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the tool's industrial application, power output, motor build..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              {/* Features (One per line) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Key Features (One feature per line)
                </label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="13mm keyless industrial chuck&#10;600W high-performance motor&#10;Dual-mode rotary and impact drilling"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition font-mono"
                />
              </div>

              {/* Image Upload or URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Product Image (Cloudflare R2 / Local Upload or URL) *
                </label>
                <ReactDropzoneUploader
                  value={imageUrl ? [imageUrl] : []}
                  onChange={(urls) => urls[0] && setImageUrl(urls[0])}
                  multiple={false}
                  label="Drop tool image here or click to upload"
                />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="OR enter Direct Image URL (https://...)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-xs font-mono text-slate-800 placeholder:text-slate-400 outline-none transition"
                />
                {imageUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="relative w-12 h-12 rounded-lg bg-white border overflow-hidden shrink-0">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xs text-slate-600 truncate font-mono flex-1">
                      {imageUrl}
                    </div>
                  </div>
                )}
              </div>

              {/* Video URL & Featured Flag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Video Demo URL (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Video className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-xs font-semibold text-slate-800 outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span className="text-xs font-extrabold text-slate-800">
                      Highlight as Featured Tool on Homepage
                    </span>
                  </label>
                </div>
              </div>

              {/* Compatible Spares multi-select */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Link Compatible Spare Parts & Accessories ({selectedSpareIds.length} selected)
                </label>
                <div className="max-h-36 overflow-y-auto p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  {spares.map((sp) => {
                    const isChecked = selectedSpareIds.includes(sp.id)
                    return (
                      <label
                        key={sp.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs font-bold transition ${
                          isChecked
                            ? 'bg-amber-100/80 text-amber-900 border border-amber-300'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{sp.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSpare(sp.id)}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 shrink-0"
                        />
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>{loading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Tool'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        title="Delete Selected Products"
        description={`Are you sure you want to permanently delete ${selectedIds.size} products? This action cannot be undone.`}
        confirmText="Yes, Delete All"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isBulkDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />
    </div>
  )
}
