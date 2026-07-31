'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  X,
  Package,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import ReactDropzoneUploader from '@/components/ReactDropzoneUploader'

interface BrandItem {
  id: string
  name: string
  slug: string
  image: string | null
  description: string | null
  isCore: boolean
  isSpecialty: boolean
  _count: {
    products: number
  }
}

interface BrandsAdminClientProps {
  brands: BrandItem[]
}

export default function BrandsAdminClient({ brands: initialBrands }: BrandsAdminClientProps) {
  const router = useRouter()
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isCore, setIsCore] = useState(true)
  const [isSpecialty, setIsSpecialty] = useState(false)

  const openNewModal = () => {
    setEditingBrand(null)
    setName('')
    setDescription('')
    setImageUrl('')
    setIsCore(true)
    setIsSpecialty(false)
    setIsModalOpen(true)
  }

  const openEditModal = (b: BrandItem) => {
    setEditingBrand(b)
    setName(b.name)
    setDescription(b.description || '')
    setImageUrl(b.image || '')
    setIsCore(b.isCore)
    setIsSpecialty(b.isSpecialty)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBrand(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      toast.error('Brand name is required.')
      return
    }

    setLoading(true)
    const toastId = toast.loading(editingBrand ? 'Updating brand...' : 'Creating new brand...')

    const payload = {
      name,
      description: description || null,
      image:
        imageUrl ||
        'https://images.unsplash.com/photo-1541888946425-d0ebb18086f6?q=80&w=800&auto=format&fit=crop',
      isCore,
      isSpecialty,
    }

    try {
      const endpoint = editingBrand ? `/api/admin/brands/${editingBrand.id}` : '/api/admin/brands'
      const method = editingBrand ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save brand')
      }

      toast.success(editingBrand ? 'Brand updated successfully!' : 'Brand created successfully!', {
        id: toastId,
      })
      closeModal()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Error saving brand', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string, count: number) => {
    if (count > 0) {
      toast.error(`Cannot delete "${name}" because it has ${count} assigned tool(s).`)
      return
    }

    if (!confirm(`Permanently delete brand "${name}"?`)) {
      return
    }

    const toastId = toast.loading('Deleting brand...')
    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deletion failed')

      toast.success('Brand deleted.', { id: toastId })
      setBrands((prev) => prev.filter((b) => b.id !== id))
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete brand', { id: toastId })
    }
  }

  const filteredBrands = useMemo(() => {
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [brands, searchQuery])

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-8 h-8 text-amber-600" />
            <span>Authorized Brands & Distributors</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage global manufacturing partners (Bosch, Makita, Dewalt, Taparia) and logos.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-3.5 rounded-2xl shadow-md hover:shadow-slate-900/20 flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5 text-amber-400" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands by name or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-slate-900 font-extrabold">{filteredBrands.length}</span> of{' '}
          {brands.length} brands
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredBrands.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-base font-bold text-slate-800">No brands found</div>
            <p className="text-xs text-slate-500 mt-1">
              Add your first brand partner or adjust your search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 pl-6 pr-4">Brand Logo & Name</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4">Distributor Status</th>
                  <th className="py-4 px-4">Assigned Tools</th>
                  <th className="py-4 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBrands.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-12 h-12 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Award className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 truncate">{item.name}</div>
                          <div className="text-xs font-mono text-slate-400 truncate">
                            {item.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.description || 'Global industrial manufacturing partner'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.isCore && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold">
                            <ShieldCheck className="w-3 h-3 text-amber-700" />
                            <span>Core Distributor</span>
                          </span>
                        )}
                        {item.isSpecialty && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-[11px] font-extrabold">
                            <Sparkles className="w-3 h-3 text-purple-700" />
                            <span>Specialty</span>
                          </span>
                        )}
                        {!item.isCore && !item.isSpecialty && (
                          <span className="text-xs text-slate-400 font-semibold">Standard</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-extrabold">
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item._count.products} Tools</span>
                      </span>
                    </td>
                    <td className="py-4 pl-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          title="Edit Brand"
                          className="p-2 rounded-xl text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name, item._count.products)}
                          title="Delete Brand"
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingBrand ? 'Edit Authorized Brand' : 'Add New Brand Partner'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure brand name, logo banner, and distributorship badges.
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
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bosch Professional"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="German precision power tool & accessory manufacturer..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Brand Logo Image (Cloudflare R2 or Local)
                </label>
                <ReactDropzoneUploader
                  value={imageUrl ? [imageUrl] : []}
                  onChange={(urls) => urls[0] && setImageUrl(urls[0])}
                  multiple={false}
                  label="Drop brand logo here or click to upload"
                />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="OR enter Direct Logo URL (https://...)"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={isCore}
                    onChange={(e) => setIsCore(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-xs font-extrabold text-slate-800">
                    Major Core Distributor
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={isSpecialty}
                    onChange={(e) => setIsSpecialty(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-xs font-extrabold text-slate-800">
                    Specialty Brand
                  </span>
                </label>
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
                    {loading ? 'Saving...' : editingBrand ? 'Save Changes' : 'Create Brand'}
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
