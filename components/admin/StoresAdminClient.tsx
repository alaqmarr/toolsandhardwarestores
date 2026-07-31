'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Phone,
  Mail,
  Clock,
  Compass,
  Star,
} from 'lucide-react'

interface StoreLocationItem {
  id: string
  name: string
  address: string
  phone: string
  email: string | null
  latitude: number
  longitude: number
  hours: string
  isPrimary: boolean
}

interface StoresAdminClientProps {
  stores: StoreLocationItem[]
}

export default function StoresAdminClient({ stores: initialStores }: StoresAdminClientProps) {
  const router = useRouter()
  const [stores, setStores] = useState<StoreLocationItem[]>(initialStores)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<StoreLocationItem | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [latitude, setLatitude] = useState<string>('17.4326')
  const [longitude, setLongitude] = useState<string>('78.4871')
  const [hours, setHours] = useState('Mon-Sat: 9:30 AM - 8:30 PM, Sun: 10:00 AM - 2:00 PM')
  const [isPrimary, setIsPrimary] = useState(false)

  const openNewModal = () => {
    setEditingStore(null)
    setName('')
    setAddress('')
    setPhone('+91 98854 16452')
    setEmail('sales@toolsandhardwarestores.com')
    setLatitude('17.4326')
    setLongitude('78.4871')
    setHours('Mon-Sat: 9:30 AM - 8:30 PM, Sun: 10:00 AM - 2:00 PM')
    setIsPrimary(stores.length === 0)
    setIsModalOpen(true)
  }

  const openEditModal = (st: StoreLocationItem) => {
    setEditingStore(st)
    setName(st.name)
    setAddress(st.address)
    setPhone(st.phone)
    setEmail(st.email || '')
    setLatitude(st.latitude.toString())
    setLongitude(st.longitude.toString())
    setHours(st.hours)
    setIsPrimary(st.isPrimary)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStore(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !address || !phone || !latitude || !longitude) {
      toast.error('Please complete all required branch fields.')
      return
    }

    const latNum = Number(latitude)
    const lngNum = Number(longitude)
    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error('Latitude and Longitude must be valid numbers.')
      return
    }

    setLoading(true)
    const toastId = toast.loading(
      editingStore ? 'Updating branch location...' : 'Creating new branch location...'
    )

    const payload = {
      name,
      address,
      phone,
      email: email || null,
      latitude: latNum,
      longitude: lngNum,
      hours,
      isPrimary,
    }

    try {
      const endpoint = editingStore ? `/api/admin/stores/${editingStore.id}` : '/api/admin/stores'
      const method = editingStore ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save branch')
      }

      toast.success(editingStore ? 'Store branch updated!' : 'Store branch created!', {
        id: toastId,
      })
      closeModal()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Error saving store branch', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete store branch "${name}"?`)) {
      return
    }

    const toastId = toast.loading('Deleting branch...')
    try {
      const res = await fetch(`/api/admin/stores/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deletion failed')

      toast.success('Store branch deleted.', { id: toastId })
      setStores((prev) => prev.filter((s) => s.id !== id))
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete store branch', { id: toastId })
    }
  }

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
  )

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <MapPin className="w-8 h-8 text-amber-600" />
            <span>Store Locations & Coordinates</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage wholesale branches, operating hours, and GPS latitude/longitude for closest-store
            routing.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-3.5 rounded-2xl shadow-md hover:shadow-slate-900/20 flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5 text-amber-400" />
          <span>Add New Store Branch</span>
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
            placeholder="Search branches by name, address, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-slate-900 font-extrabold">{filteredStores.length}</span> of{' '}
          {stores.length} store locations
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredStores.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-base font-bold text-slate-800">No store branches found</div>
            <p className="text-xs text-slate-500 mt-1">
              Add your first store branch with exact latitude and longitude coordinates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 pl-6 pr-4">Branch Name & Type</th>
                  <th className="py-4 px-4">Address & Contact</th>
                  <th className="py-4 px-4">GPS Coordinates</th>
                  <th className="py-4 px-4">Operating Hours</th>
                  <th className="py-4 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStores.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 pl-6 pr-4">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.isPrimary && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold">
                              <Star className="w-3 h-3 text-amber-700 fill-amber-500" />
                              <span>HQ / Primary</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-400">{item.id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-800">{item.address}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3 text-amber-600" />
                            {item.phone}
                          </span>
                          {item.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3 h-3 text-amber-600" />
                              {item.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold">
                        <Compass className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.hours}</span>
                      </div>
                    </td>
                    <td className="py-4 pl-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          title="Edit Store"
                          className="p-2 rounded-xl text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Delete Store"
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
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingStore ? 'Edit Store Branch' : 'Add New Store Branch'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter exact GPS coordinates to power closest-store location routing.
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
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ranigunj Wholesale HQ or Jeedimetla Industrial Branch"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Complete Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="5-5, 187/2, Victoria Ranigunj, Old Ghasmandi, Secunderabad..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98854 16452"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@toolsandhardwarestores.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Exact Coordinates */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-700" />
                  <span>GPS Coordinates for Distance Routing</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="17.4326"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-mono font-bold text-slate-900 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="78.4871"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-mono font-bold text-slate-900 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Operating Hours *
                </label>
                <input
                  type="text"
                  required
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Mon-Sat: 9:30 AM - 8:30 PM, Sun: 10:00 AM - 2:00 PM"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-xs font-extrabold text-slate-800">
                    Set as Headquarters / Primary Store Location
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
                    {loading ? 'Saving...' : editingStore ? 'Save Changes' : 'Create Branch'}
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
