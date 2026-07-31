'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  X,
  Package,
} from 'lucide-react'
import ReactDropzoneUploader from '@/components/ReactDropzoneUploader'
import ConfirmDialog from './ConfirmDialog'

interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  _count: {
    products: number
  }
}

interface CategoriesAdminClientProps {
  categories: CategoryItem[]
}

export default function CategoriesAdminClient({
  categories: initialCategories,
}: CategoriesAdminClientProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const openNewModal = () => {
    setEditingCategory(null)
    setName('')
    setDescription('')
    setImageUrl('')
    setIsModalOpen(true)
  }

  const openEditModal = (c: CategoryItem) => {
    setEditingCategory(c)
    setName(c.name)
    setDescription(c.description || '')
    setImageUrl(c.image || '')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      toast.error('Please enter a category name.')
      return
    }

    setLoading(true)
    const toastId = toast.loading(
      editingCategory ? 'Updating tool category...' : 'Creating new tool category...'
    )

    const payload = {
      name,
      description: description || null,
      image:
        imageUrl ||
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
    }

    try {
      const endpoint = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category')
      }

      toast.success(editingCategory ? 'Category updated!' : 'Category created!', {
        id: toastId,
      })
      closeModal()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Error saving category', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string, count: number) => {
    if (count > 0) {
      toast.error(`Cannot delete "${name}" because it has ${count} assigned tool(s).`)
      return
    }

    if (!confirm(`Are you sure you want to permanently delete category "${name}"?`)) {
      return
    }

    const toastId = toast.loading('Deleting category...')
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deletion failed')

      toast.success('Category deleted.', { id: toastId })
      setCategories((prev) => prev.filter((c) => c.id !== id))
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category', { id: toastId })
    }
  }

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [categories, searchQuery])

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleAll = () => {
    if (selectedIds.size === filteredCategories.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredCategories.map(c => c.id)))
    }
  }

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true)
    const toastId = toast.loading('Deleting selected categories...')
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Bulk deletion failed')

      toast.success(data.message || 'Categories deleted successfully.', { id: toastId })
      setCategories((prev) => prev.filter((c) => !selectedIds.has(c.id)))
      setSelectedIds(new Set())
      setIsBulkDeleteModalOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete categories', { id: toastId })
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
            <Layers className="w-8 h-8 text-amber-600" />
            <span>Product Categories Directory</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage power tool groups, hand tool classifications, and machinery categories.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-3.5 rounded-2xl shadow-md hover:shadow-slate-900/20 flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5 text-amber-400" />
          <span>Add New Category</span>
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
            placeholder="Search categories by name, slug, or details..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
          />
        </div>
        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2.5 rounded-xl border border-red-200 transition flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          )}
          <div className="text-xs font-bold text-slate-500">
            Showing <span className="text-slate-900 font-extrabold">{filteredCategories.length}</span> of{' '}
            {categories.length} categories
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-base font-bold text-slate-800">No categories found</div>
            <p className="text-xs text-slate-500 mt-1">
              Create your first product category or change your search filter.
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
                      checked={filteredCategories.length > 0 && selectedIds.size === filteredCategories.length}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                  </th>
                  <th className="py-4 px-4">Category & Banner</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4">Assigned Tools</th>
                  <th className="py-4 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCategories.map((item) => (
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
                        <div className="relative w-14 h-11 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0">
                          <img
                            src={
                              item.image ||
                              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop'
                            }
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
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
                        {item.description || 'Industrial tools and equipment category'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-extrabold">
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item._count.products} Tools</span>
                      </span>
                    </td>
                    <td className="py-4 pl-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/categories/${item.slug}`}
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
                          title="Edit Category"
                          className="p-2 rounded-xl text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name, item._count.products)}
                          title="Delete Category"
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
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingCategory ? 'Edit Category Item' : 'Add New Category'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure category name, slug ID, and banner image.
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Power Tools"
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
                  placeholder="Professional industrial power drills, saws, and grinders..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category Banner Image (Cloudflare R2 or Local)
                </label>
                <ReactDropzoneUploader
                  value={imageUrl ? [imageUrl] : []}
                  onChange={(urls) => urls[0] && setImageUrl(urls[0])}
                  multiple={false}
                  label="Drop category banner image here or click to upload"
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
                    {loading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        title="Delete Selected Categories"
        description={`Are you sure you want to permanently delete ${selectedIds.size} categories? This action cannot be undone and will affect associated products.`}
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
