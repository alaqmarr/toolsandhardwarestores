'use client'

import React, { useState, useEffect } from 'react'
import { Share2, Copy, Check, X } from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'
import toast from 'react-hot-toast'

interface ShareButtonProps {
  title: string
  text?: string
  className?: string
  buttonText?: string
}

export default function ShareButton({
  title,
  text,
  className,
  buttonText = 'Share Product',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(window.location.href)
    }
  }, [])

  const handleCopy = () => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text || `Check out ${title} at Tools & Hardware Stores!`,
          url: url,
        })
      } catch (err) {
        // Ignored if user cancels dialog
      }
    } else {
      handleCopy()
      toast('Native share menu is not supported on this device. Link copied instead!', {
        icon: '📋',
      })
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition font-bold text-xs shadow-xs'
        }
      >
        <Share2 className="w-3.5 h-3.5 text-red-600" />
        <span>{buttonText}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Share this Page</h3>
                  <p className="text-xs text-slate-500">
                    Copy the entire URL or share to applications
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Full Page URL Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Current Page URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={url}
                  onClick={(e) => e.currentTarget.select()}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono select-all focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Share Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full bg-red-50 hover:bg-red-100/80 text-red-900 border border-red-200 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xs"
              >
                <Share2 className="w-4 h-4 text-red-600" />
                <span>Native Share Menu</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `${text || `Check out ${title}`}: ${url}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xs"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
