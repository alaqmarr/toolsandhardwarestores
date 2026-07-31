'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Settings,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Database,
  Cloud,
  Lock,
  Check,
  ShieldAlert,
  Server,
  Globe,
} from 'lucide-react'

interface ContactSettingItem {
  id: string
  primaryPhone: string
  whatsappNumber: string
  primaryEmail: string
  supportEmail: string | null
  addressText: string
  mapEmbedUrl: string | null
  smtpHost: string | null
  smtpPort: number | null
  smtpUser: string | null
  smtpPass: string | null
  r2Bucket: string | null
  r2AccountId: string | null
  r2AccessKeyId: string | null
  r2SecretKey: string | null
  r2PublicUrl: string | null
}

interface SettingsAdminClientProps {
  settings: ContactSettingItem | null
}

export default function SettingsAdminClient({ settings: initial }: SettingsAdminClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'contact' | 'smtp' | 'r2'>('contact')
  const [loading, setLoading] = useState(false)

  // Form states
  const [primaryPhone, setPrimaryPhone] = useState(initial?.primaryPhone || '+91 98854 16452')
  const [whatsappNumber, setWhatsappNumber] = useState(initial?.whatsappNumber || '919885416452')
  const [primaryEmail, setPrimaryEmail] = useState(
    initial?.primaryEmail || 'sales@toolsandhardwarestores.com'
  )
  const [supportEmail, setSupportEmail] = useState(initial?.supportEmail || '')
  const [addressText, setAddressText] = useState(
    initial?.addressText ||
      '5-5, 187/2, Victoria Ranigunj, Old Ghasmandi, Ranigunj, Secunderabad, Telangana 500003'
  )
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initial?.mapEmbedUrl || '')

  // SMTP
  const [smtpHost, setSmtpHost] = useState(initial?.smtpHost || 'smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState(initial?.smtpPort?.toString() || '465')
  const [smtpUser, setSmtpUser] = useState(initial?.smtpUser || '')
  const [smtpPass, setSmtpPass] = useState(initial?.smtpPass || '')

  // R2
  const [r2Bucket, setR2Bucket] = useState(initial?.r2Bucket || '')
  const [r2AccountId, setR2AccountId] = useState(initial?.r2AccountId || '')
  const [r2AccessKeyId, setR2AccessKeyId] = useState(initial?.r2AccessKeyId || '')
  const [r2SecretKey, setR2SecretKey] = useState(initial?.r2SecretKey || '')
  const [r2PublicUrl, setR2PublicUrl] = useState(initial?.r2PublicUrl || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading('Saving global portal settings...')

    const payload = {
      primaryPhone,
      whatsappNumber,
      primaryEmail,
      supportEmail: supportEmail || null,
      addressText,
      mapEmbedUrl: mapEmbedUrl || null,
      smtpHost: smtpHost || null,
      smtpPort: smtpPort ? Number(smtpPort) : 465,
      smtpUser: smtpUser || null,
      smtpPass: smtpPass || null,
      r2Bucket: r2Bucket || null,
      r2AccountId: r2AccountId || null,
      r2AccessKeyId: r2AccessKeyId || null,
      r2SecretKey: r2SecretKey || null,
      r2PublicUrl: r2PublicUrl || null,
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings')
      }

      toast.success('Global portal settings saved!', { id: toastId })
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Error updating settings', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="w-8 h-8 text-amber-600" />
            <span>Global Store & System Settings</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Configure WhatsApp chat digits, primary contact info, Gmail SMTP mailer, and Cloudflare R2
            secrets.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-md hover:shadow-slate-900/20 flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Check className="w-5 h-5 text-amber-400" />
          <span>{loading ? 'Saving Settings...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'contact'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Phone className="w-4 h-4 text-amber-400" />
          <span>Contact & WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'smtp'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Mail className="w-4 h-4 text-amber-400" />
          <span>Gmail SMTP Mailer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('r2')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'r2'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Cloud className="w-4 h-4 text-amber-400" />
          <span>Cloudflare R2 Storage</span>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* TAB 1: CONTACT */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-600" />
                <span>Store Contact Details & WhatsApp Configuration</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                These numbers power the sticky WhatsApp chat widget and customer invoice headers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Primary Display Phone *
                </label>
                <input
                  type="text"
                  required
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  placeholder="+91 98854 16452"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  WhatsApp Numeric Number (Country Code without +) *
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="919885416452"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-mono font-bold text-slate-900 outline-none transition"
                />
                <p className="text-[11px] text-slate-500 font-semibold">
                  Example: 919885416452 (used for wa.me redirect)
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Primary Sales Email *
                </label>
                <input
                  type="email"
                  required
                  value={primaryEmail}
                  onChange={(e) => setPrimaryEmail(e.target.value)}
                  placeholder="sales@toolsandhardwarestores.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Support Email (Optional)
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@toolsandhardwarestores.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                HQ Complete Street Address *
              </label>
              <textarea
                rows={2}
                required
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="5-5, 187/2, Victoria Ranigunj, Old Ghasmandi, Ranigunj, Secunderabad, Telangana 500003"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Google Maps Embed URL (Optional iframe src or link)
              </label>
              <input
                type="text"
                value={mapEmbedUrl}
                onChange={(e) => setMapEmbedUrl(e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-xs font-mono text-slate-800 outline-none transition"
              />
            </div>
          </div>
        )}

        {/* TAB 2: SMTP */}
        {activeTab === 'smtp' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-amber-600" />
                <span>Gmail SMTP Credentials & Outgoing Mailer</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Used by Nodemailer to deliver wholesale quotes, contact inquiries, and customer
                notifications.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="font-extrabold">Gmail App Password Setup Instruction:</div>
              <p>
                Use port <strong>465 (SSL/TLS)</strong> with your Gmail Account and generate a 16-character
                App Password in your Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  SMTP Host *
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  SMTP Port *
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="465"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  SMTP Username (Gmail Address)
                </label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="yourstore@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  SMTP App Password (16 chars)
                </label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-mono font-bold text-slate-900 outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: R2 STORAGE */}
        {activeTab === 'r2' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-amber-600" />
                <span>Cloudflare R2 Object Storage Keys</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your R2 bucket credentials for image uploads in Products, Spares, Categories, and Brands.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-600" />
                <span>Environment Variable Integration</span>
              </div>
              <p>
                Your Cloudflare R2 secrets have already been configured in <code>.env</code>. You can view
                or override them here to change storage buckets without restarting the server.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  R2 Bucket Name
                </label>
                <input
                  type="text"
                  value={r2Bucket}
                  onChange={(e) => setR2Bucket(e.target.value)}
                  placeholder="toolsandhardwarestores-media"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-semibold text-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cloudflare Account ID
                </label>
                <input
                  type="text"
                  value={r2AccountId}
                  onChange={(e) => setR2AccountId(e.target.value)}
                  placeholder="e.g. 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-mono text-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  R2 Access Key ID
                </label>
                <input
                  type="text"
                  value={r2AccessKeyId}
                  onChange={(e) => setR2AccessKeyId(e.target.value)}
                  placeholder="e.g. abcdef0123456789"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-mono text-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  R2 Secret Access Key
                </label>
                <input
                  type="password"
                  value={r2SecretKey}
                  onChange={(e) => setR2SecretKey(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-mono text-slate-900 outline-none transition"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Public Custom Domain URL / r2.dev URL
                </label>
                <input
                  type="url"
                  value={r2PublicUrl}
                  onChange={(e) => setR2PublicUrl(e.target.value)}
                  placeholder="https://pub-xxxxxx.r2.dev"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 text-sm font-mono text-slate-900 outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-md hover:shadow-slate-900/20 flex items-center gap-2 transition active:scale-95"
          >
            <Check className="w-5 h-5 text-amber-400" />
            <span>{loading ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
