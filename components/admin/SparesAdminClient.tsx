'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  X,
  Package,
  Layers,
} from 'lucide-react'
import ReactDropzoneUploader from '@/components/ReactDropzoneUploader'

interface SpareCategoryItem {
  id: string
  name: string
  slug: string
}

interface ProductItem {
  id: string
  name: string
  slug: string
}

interface SpareItem {
  id: string
  name: string
  slug: string
  description: string | null
  images: string
  priceNote: string | null
  spareCategoryId: string
  spareCategory: SpareCategoryItem
  products: Array<{
    product: ProductItem
  }>
}

interface SparesAdminClientProps {
  spares: SpareItem[]
  categories: SpareCategoryItem[]
  products: ProductItem[]
}

export default function SparesAdminClient({
  spares: initialSpares,
  categories,
  products,
}: SparesAdminClientProps) {
  const router = useRouter()
  const [spares, setSpares] = useState<SpareItem[]>(initialSpares)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState<string>('ALL')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSpare, setEditingSpare] = useState<SpareItem | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [spareCategoryId, setSpareCategoryId] = useState(categories[0]?.id || '')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [priceNote, setPriceNote] = useState('Wholesale Bulk & Retail Availability')
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  const openNewModal = () => {
    setEditingSpare(null)
    setName('')
    setSpareCategoryId(categories[0]?.id || '')
    setDescription('')
    setImageUrl('')
    setPriceNote('Wholesale Bulk & Retail Availability')
    setSelectedProductIds([])
    setIsModalOpen(true)
  }

  const openEditModal = (s: SpareItem) => {
    setEditingSpare(s)
    setName(s.name)
    setSpareCategoryId(s.spareCategoryId)
    setDescription(s.description || '')
    setImageUrl(s.images)
    setPriceNote(s.priceNote || '')
    setSelectedProductIds(s.products.map((p) => p.product.id))
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSpare(null)
  }

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !spareCategoryId) {
      toast.error('Please enter a spare part name and category.')
      return
    }

    setLoading(true)
    const toastId = toast.loading(
      editingSpare ? 'Updating spare part catalog...' : 'Creating new spare part...'
    )

    const payload = {
      name,
      spareCategoryId,
      description: description || null,
      images:
        imageUrl ||
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
      priceNote: priceNote || 'Wholesale Bulk & Retail Availability',
      productIds: selectedProductIds,
    }

    try {
      const endpoint = editingSpare ? `/api/admin/spares/${editingSpare.id}` : '/api/admin/spares'
      const method = editingSpare ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save spare part')
      }

      toast.success(editingSpare ? 'Spare updated successfully!' : 'Spare created successfully!', {
        id: toastId,
      })
      closeModal()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Error saving spare part', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete spare "${name}"?`)) {
      return
    }

    const toastId = toast.loading('Deleting spare part...')
    try {
      const res = await fetch(`/api/admin/spares/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deletion failed')

      toast.success('Spare part deleted.', { id: toastId })
      setSpares((prev) => prev.filter((s) => s.id !== id))
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete spare part', { id: toastId })
    }
  }

  const filteredSpares = useMemo(() => {
    return spares.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCat === 'ALL' || s.spareCategoryId === selectedCat
      return matchesSearch && matchesCategory
    })
  }, [spares, searchQuery, selectedCat])

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wrench className="w-8 h-8 text-amber-600" />
            <span>Spare Parts & Accessories Catalog</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage armature coils, carbon brushes, gearboxes, switches, and their compatible tools.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-3.5 rounded-2xl shadow-md hover:shadow-slate-900/20 flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5 text-amber-400" />
          <span>Add New Spare Part</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spares by name, ID, or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
            />
          </div>

          {/* Category Select */}
          <div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-700 bg-white outline-none transition"
            >
              <option value="ALL">All Spare Categories ({categories.length})</option>
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
            Showing <span className="font-bold text-slate-900">{filteredSpares.length}</span> of{' '}
            {spares.length} spare parts
          </div>
          {(selectedCat !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedCat('ALL')
              }}
              className="text-amber-700 hover:text-amber-800 underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Spares Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredSpares.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-base font-bold text-slate-800">No spare parts found</div>
            <p className="text-xs text-slate-500 mt-1">
              Add your first spare part or change your filter selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 pl-6 pr-4">Spare Part & Image</th>
                  <th className="py-4 px-4">Spare Category</th>
                  <th className="py-4 px-4">Wholesale Note</th>
                  <th className="py-4 px-4">Compatible Tools</th>
                  <th className="py-4 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSpares.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 pl-6 pr-4">
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/60 text-xs font-bold">
                        <Layers className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{item.spareCategory?.name || 'Uncategorized'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-slate-700">
                        {item.priceNote || 'Wholesale Bulk Available'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-extrabold">
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.products.length} Tools Linked</span>
                      </span>
                    </td>
                    <td className="py-4 pl-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/spares/${item.slug}`}
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
                          title="Edit Spare"
                          className="p-2 rounded-xl text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Delete Spare"
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingSpare ? 'Edit Spare Part Item' : 'Add New Spare Part'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure spare image, wholesale note, and compatible power tools.
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Spare Part Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Armature Bosch GSB 600 Original"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Spare Category *
                </label>
                <select
                  value={spareCategoryId}
                  onChange={(e) => setSpareCategoryId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-800 bg-white outline-none transition"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Copper wound industrial armature coil..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Wholesale & Retail Note
                </label>
                <input
                  type="text"
                  value={priceNote}
                  onChange={(e) => setPriceNote(e.target.value)}
                  placeholder="e.g. Wholesale Bulk & Retail Availability"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Spare Part Image (Cloudflare R2 or Local) *
                </label>
                <ReactDropzoneUploader
                  value={imageUrl ? [imageUrl] : []}
                  onChange={(urls) => urls[0] && setImageUrl(urls[0])}
                  multiple={false}
                  label="Drop spare part image here or click to upload"
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

              {/* Compatible Tools Multi-Select */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Compatible Power Tools ({selectedProductIds.length} selected)
                </label>
                <div className="max-h-36 overflow-y-auto p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  {products.map((pd) => {
                    const isChecked = selectedProductIds.includes(pd.id)
                    return (
                      <label
                        key={pd.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs font-bold transition ${
                          isChecked
                            ? 'bg-amber-100/80 text-amber-900 border border-amber-300'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{pd.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleProduct(pd.id)}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 shrink-0"
                        />
                      </label>
                    )
                  })}
                </div>
              </div>

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
                  <span>
                    {loading ? 'Saving...' : editingSpare ? 'Save Changes' : 'Create Spare Part'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
