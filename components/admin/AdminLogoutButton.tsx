'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { LogOut } from 'lucide-react'

export default function AdminLogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const toastId = toast.loading('Signing out...')
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      toast.success('Signed out successfully.', { id: toastId })
      router.push('/admin/login')
      router.refresh()
    } catch {
      toast.error('Logout failed.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition disabled:opacity-50"
    >
      <LogOut className="w-4 h-4" />
      <span>{loading ? 'Logging out...' : 'Sign Out'}</span>
    </button>
  )
}
