'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Wrench,
  Search,
  MapPin,
  Menu,
  X,
  Star,
  Settings,
} from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'
import NavbarUniversalSearch from './NavbarUniversalSearch'
import { getWhatsAppInquiryUrl } from '@/lib/whatsapp'

interface NavbarProps {
  primaryPhone: string
  addressText: string
}

export default function Navbar({ primaryPhone, addressText }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const [closestStore, setClosestStore] = useState<{
    name: string
    dist: string
    url: string
  } | null>(null)
  const [locating, setLocating] = useState(false)

  const handleFindClosestStore = () => {
    setLocating(true)
    if (!navigator.geolocation) {
      setClosestStore({
        name: 'Flagship Showroom',
        dist: 'Central Hub',
        url: 'https://www.google.com/maps/dir/?api=1&destination=17.4326,78.4850',
      })
      setLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat1 = pos.coords.latitude
        const lon1 = pos.coords.longitude
        const lat2 = 17.4326
        const lon2 = 78.4850
        const R = 6371 // km
        const dLat = ((lat2 - lat1) * Math.PI) / 180
        const dLon = ((lon2 - lon1) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const d = R * c
        setClosestStore({
          name: 'Flagship Showroom',
          dist: `${d.toFixed(1)} km away`,
          url: `https://www.google.com/maps/dir/?api=1&destination=17.4326,78.4850`,
        })
        setLocating(false)
      },
      () => {
        setClosestStore({
          name: 'Flagship Showroom',
          dist: 'Central Hub',
          url: 'https://www.google.com/maps/dir/?api=1&destination=17.4326,78.4850',
        })
        setLocating(false)
      }
    )
  }

  const waUrl = getWhatsAppInquiryUrl({
    phone: primaryPhone,
    itemName: 'Tools & Hardware Stores Consultation',
    itemType: 'General Consultation',
    extraNotes: 'Visiting from website Navigation Bar',
  })

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Brands', href: '/brands' },
    { name: 'Categories', href: '/categories' },
    { name: 'Products', href: '/products' },
    { name: 'Spares', href: '/spares' },
    { name: 'Resources', href: '/resources' },
    { name: 'About', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top micro bar with rating & location banner */}
      <div className="bg-slate-900 text-white py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-slate-200">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              4.9★ Rated
              <span className="text-slate-300 font-normal">(379+ Reviews)</span>
            </span>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300 truncate max-w-md">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              Ranigunj HQ • Ready Stock & Counter Supply
            </span>
          </div>
          <div className="flex items-center gap-3">
            {closestStore ? (
              <div className="flex items-center gap-2 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/40 text-red-300 font-bold">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>
                  Closest: {closestStore.name} ({closestStore.dist})
                </span>
                <a
                  href={closestStore.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-500 hover:bg-red-400 text-white px-2 py-0.5 rounded text-[10px] font-black transition ml-1"
                >
                  Get Directions ↗
                </a>
              </div>
            ) : (
              <button
                onClick={handleFindClosestStore}
                disabled={locating}
                className="text-red-400 hover:text-red-300 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3" />
                <span>{locating ? 'Locating...' : 'Find Closest Store'}</span>
              </button>
            )}
            <span className="text-slate-600">|</span>
            <Link
              href="/admin"
              className="text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation Tier 1: Logo, Wide Prominent Universal Search Bar, and Right CTA Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1 group-hover:scale-105 group-hover:border-red-600 transition">
              <img
                src="/logo-whitebg.png"
                alt="Tools & Hardware Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-red-600 transition">
              TOOLS & HARDWARE
            </div>
          </Link>

          {/* Huge, Un-squeezed Center Search Bar (Tier 1) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <NavbarUniversalSearch />
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              href="/contact#locator"
              className="hidden xl:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-extrabold text-slate-700 transition whitespace-nowrap"
            >
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Stores</span>
            </Link>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition whitespace-nowrap"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Enquire on WhatsApp</span>
            </a>
          </div>

          {/* Mobile search + menu toggle buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen)
                setMobileMenuOpen(false)
              }}
              className="p-2.5 rounded-xl text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition"
              aria-label="Toggle mobile search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen)
                setMobileSearchOpen(false)
              }}
              className="p-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 shadow-lg">
          <NavbarUniversalSearch onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {/* Tier 2: Dedicated Horizontal Navigation Bar (Desktop & Large screens) */}
      <div className="hidden md:block bg-gradient-to-r from-slate-100 via-blue-50/70 to-slate-100 border-t border-b border-blue-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold transition ${
                      isActive
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-red-600 hover:bg-blue-100/60'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-4 text-xs font-extrabold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% Authorized Distributor</span>
              </span>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-lg">
          <div className="w-full">
            <NavbarUniversalSearch />
          </div>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-base font-bold transition ${
                  pathname === link.href
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-slate-700 hover:text-red-600 hover:bg-blue-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            >
              Admin Dashboard
            </Link>
          </nav>

          <div className="pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
            >
              <WhatsAppIcon className="w-5 h-5 text-white" />
              <span>Enquire on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
