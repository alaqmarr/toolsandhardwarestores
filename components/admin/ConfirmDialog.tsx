'use client'

import React from 'react'
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: React.ReactNode
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onCancel : undefined}
      />
      
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all m-4">
        {/* Header */}
        <div className={"px-6 py-4 flex items-center gap-3 border-b "}>
          <div className={"p-2 rounded-full "}>
            {isDangerous ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 flex-1">{title}</h3>
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-5 text-slate-600">
          {description}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={"px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors "}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}