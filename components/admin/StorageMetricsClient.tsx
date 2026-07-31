'use client'

import React, { useState, useEffect } from 'react'
import {
  Database,
  Cloud,
  HardDrive,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'

interface StorageMetricsData {
  isR2Connected: boolean
  bucketName: string
  totalObjects: number
  totalSizeBytes: number
  totalSizeFormatted: string
  freeTierQuotaGB: number
  freeTierUsedPercent: number
  egressCostUSD: string
  classAOperations: number
  classBOperations: number
  categoryBreakdown: Array<{
    category: string
    count: number
    sizeMB: string
    percentage: number
  }>
  recentFiles: Array<{
    key: string
    sizeFormatted: string
    lastModified: string
    url: string
  }>
  lastUpdated: string
}

export default function StorageMetricsClient() {
  const [data, setData] = useState<StorageMetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchMetrics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError('')

      const res = await fetch('/api/admin/storage-metrics')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        setError('Failed to load storage telemetry')
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching storage metrics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    // Auto refresh every 30 seconds for real-time tracking
    const interval = setInterval(() => fetchMetrics(true), 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-500">
          Syncing realtime Cloudflare R2 telemetry...
        </p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 rounded-2xl p-6 border border-rose-200 text-rose-700 space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="w-5 h-5" />
          <span>Storage Metrics Error</span>
        </div>
        <p className="text-xs">{error}</p>
        <button
          onClick={() => fetchMetrics()}
          className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl mt-2"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Title & Live Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              Realtime Telemetry Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cloudflare R2 Storage Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Bucket: <strong className="text-slate-900">{data.bucketName}</strong> • Updated:{' '}
            {new Date(data.lastUpdated).toLocaleTimeString()}
          </p>
        </div>

        <button
          onClick={() => fetchMetrics(true)}
          disabled={refreshing}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-3 rounded-2xl transition shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* 4 Realtime KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Storage Used */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Storage Consumed
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {data.totalSizeFormatted}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Optimal Object Compression</span>
          </div>
        </div>

        {/* Total Objects / Files */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Total Objects
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {data.totalObjects}
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Catalogues, Images & Media
          </div>
        </div>

        {/* Cloudflare R2 Free Tier Quota */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              10 GB Free Tier Quota
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {data.freeTierUsedPercent}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, data.freeTierUsedPercent)}%` }}
            />
          </div>
        </div>

        {/* Zero Egress Fees Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Monthly Egress Cost
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            $0.00 USD
          </div>
          <div className="text-xs font-bold text-slate-500">
            Cloudflare R2 Zero Egress Policy
          </div>
        </div>
      </div>

      {/* Storage Breakdown by Category */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Storage Allocation Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Distribution across catalogues, product webp images, and brand assets
            </p>
          </div>
          <Layers className="w-5 h-5 text-slate-400" />
        </div>

        <div className="space-y-5">
          {data.categoryBreakdown.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900">
                  {item.category}{' '}
                  <span className="text-slate-400 font-normal">({item.count} items)</span>
                </span>
                <span className="text-amber-700 font-extrabold">
                  {item.sizeMB} MB ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Objects Explorer Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Realtime Object Explorer
            </h3>
            <p className="text-xs text-slate-500">
              Recently uploaded catalogues and industrial assets in R2 bucket
            </p>
          </div>
          <Cloud className="w-5 h-5 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Object Key / Title</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4 text-right">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.recentFiles.map((file, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate max-w-sm">{file.key}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600 text-xs">
                    {file.sizeFormatted}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs">
                    {file.lastModified}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-600 transition"
                    >
                      <span>View</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
