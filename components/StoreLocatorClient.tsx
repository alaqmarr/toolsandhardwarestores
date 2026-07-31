'use client'

import React, { useState, useEffect } from 'react'
import {
  MapPin,
  Navigation,
  Phone,
  Mail,
  ExternalLink,
  Award,
  Compass,
} from 'lucide-react'

export interface StoreLocationItem {
  id: string
  name: string
  address: string
  phone: string
  email: string | null
  latitude: number
  longitude: number
  isPrimary: boolean
  hours: string
}

interface StoreLocatorClientProps {
  storeLocations: StoreLocationItem[]
}

// Haversine formula to compute distance in km between two lat/lng pairs
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function StoreLocatorClient({
  storeLocations,
}: StoreLocatorClientProps) {
  const [userCoords, setUserCoords] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [sortedStores, setSortedStores] = useState<
    (StoreLocationItem & { distanceKm?: number })[]
  >(storeLocations)

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }
    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserCoords({ latitude, longitude })
        setIsLocating(false)

        // Compute distances and sort stores by distance ascending
        const withDistances = storeLocations.map((store) => {
          const dist = calculateDistance(
            latitude,
            longitude,
            store.latitude,
            store.longitude
          )
          return { ...store, distanceKm: Math.round(dist * 10) / 10 }
        })

        withDistances.sort(
          (a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999)
        )
        setSortedStores(withDistances)
      },
      (error) => {
        setIsLocating(false)
        setLocationError(
          'Unable to retrieve your location. Please check browser permissions.'
        )
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const closestStore = userCoords && sortedStores.length > 0 ? sortedStores[0] : null

  return (
    <div className="space-y-8">
      {/* Locator Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-white">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold text-red-400">
            <Compass className="w-3.5 h-3.5 text-red-400" />
            <span>GPS STORE LOCATOR</span>
          </div>
          <h3 className="text-2xl font-black text-white">
            Find the Closest Store to Your Location
          </h3>
          <p className="text-sm text-slate-300 max-w-xl">
            Click the button below to detect your GPS and immediately view the closest showroom with driving directions right here.
          </p>

          {closestStore && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-800/90 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                    Closest Store Detected
                  </span>
                  {closestStore.distanceKm !== undefined && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-2 py-0.5 rounded border border-emerald-500/30">
                      {closestStore.distanceKm} km away
                    </span>
                  )}
                </div>
                <div className="font-extrabold text-white text-base sm:text-lg">
                  {closestStore.name}
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{closestStore.address}</span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${closestStore.latitude},${closestStore.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-2 shadow-md"
              >
                <span>Get Driving Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold px-6 py-4 rounded-xl transition flex items-center justify-center gap-2.5 shadow-md disabled:opacity-50"
          >
            <Navigation className="w-5 h-5" />
            <span>{isLocating ? 'Locating Your GPS...' : 'Find Closest Store'}</span>
          </button>

          {userCoords && (
            <span className="text-xs text-emerald-400 font-bold">
              ✓ Location detected ({userCoords.latitude.toFixed(3)}, {userCoords.longitude.toFixed(3)})
            </span>
          )}
          {locationError && (
            <span className="text-xs text-rose-400 font-semibold">{locationError}</span>
          )}
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedStores.map((store, index) => {
          const isClosest = userCoords && index === 0
          return (
            <div
              key={store.id}
              className={`bg-white rounded-2xl p-6 border transition flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md ${
                isClosest
                  ? 'border-red-500 bg-red-50/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  {store.isPrimary ? (
                    <span className="bg-red-50 text-red-900 text-xs font-extrabold px-3 py-1 rounded-full border border-red-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-red-600" />
                      <span>Flagship Store</span>
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
                      Branch Showroom
                    </span>
                  )}

                  {store.distanceKm !== undefined && (
                    <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-1 rounded-lg border border-emerald-300">
                      {store.distanceKm} km away
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xl font-black text-slate-900">{store.name}</h4>
                  <div className="flex items-start gap-2.5 text-sm text-slate-600 mt-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Phone className="w-4 h-4 text-red-500 shrink-0" />
                    <a
                      href={`tel:${store.phone}`}
                      className="font-bold hover:text-red-600 transition"
                    >
                      {store.phone}
                    </a>
                  </div>

                  {store.email && (
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Mail className="w-4 h-4 text-red-500 shrink-0" />
                      <a
                        href={`mailto:${store.email}`}
                        className="hover:text-red-600 transition truncate"
                      >
                        {store.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 group shadow-sm"
                >
                  <span>Get Driving Directions</span>
                  <ExternalLink className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
