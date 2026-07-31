'use client'

import React, { useState } from 'react'
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  Phone,
  HelpCircle,
} from 'lucide-react'

export default function ContactEmailForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'WHOLESALE_PRICE',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null
    text: string
  }>({ type: null, text: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: null, text: '' })

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry')
      }

      setStatus({
        type: 'success',
        text: 'Thank you! Your inquiry has been sent to our store sales desk. We will get back to you shortly.',
      })
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'WHOLESALE_PRICE',
        message: '',
      })
    } catch (err: any) {
      setStatus({
        type: 'error',
        text:
          err.message ||
          'An unexpected error occurred. Please reach out via WhatsApp.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
      <div className="space-y-2">
        <div className="text-xs font-bold text-red-600 uppercase tracking-widest">
          Customer Support Desk
        </div>
        <h3 className="text-2xl font-black text-slate-900">
          Send an Inquiry
        </h3>
        <p className="text-sm text-slate-600">
          Fill out the form below. Your message will be dispatched directly to our sales &
          support team via email.
        </p>
      </div>

      {status.type && (
        <div
          className={`p-4 rounded-xl text-sm font-bold border flex items-center gap-2 ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="Contractor / Company Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Phone / WhatsApp Number *
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98854 16452"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Inquiry Subject *
            </label>
            <select
              value={formData.inquiryType}
              onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition"
            >
              <option value="General Store Inquiry">General Store Inquiry</option>
              <option value="Wholesale Bulk Quote">Wholesale Bulk Quote</option>
              <option value="Spare Parts Fitment Support">Spare Parts Fitment Support</option>
              <option value="Dealer & Distribution Partnership">
                Dealer & Distribution Partnership
              </option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Your Requirement / Message *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Please specify tool model numbers, spare part armatures, or quantity required..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Sending Inquiry...' : 'Submit Inquiry'}</span>
        </button>
      </form>
    </div>
  )
}
