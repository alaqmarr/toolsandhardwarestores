'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (nextPage: number) => void
  itemLabel?: string
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'items',
}: PaginationProps) {
  if (totalItems === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  // Build compact page range with ellipses
  const pages: Array<number | 'ellipsis-left' | 'ellipsis-right'> = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('ellipsis-left')
    const midStart = Math.max(2, page - 1)
    const midEnd = Math.min(totalPages - 1, page + 1)
    for (let i = midStart; i <= midEnd; i++) pages.push(i)
    if (page < totalPages - 2) pages.push('ellipsis-right')
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 px-4 sm:px-6 py-4 shadow-xs">
      <div className="text-xs sm:text-sm font-semibold text-slate-600">
        Showing <span className="font-extrabold text-slate-900">{start}–{end}</span> of{' '}
        <span className="font-extrabold text-slate-900">{totalItems.toLocaleString()}</span> {itemLabel}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {pages.map((p) => {
            if (typeof p !== 'number') {
              return (
                <span key={p} className="px-2 text-xs font-bold text-slate-400">
                  …
                </span>
              )
            }
            const active = p === page
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-9 h-9 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  active
                    ? 'bg-red-600 text-white shadow-sm border border-red-600'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            )
          })}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
