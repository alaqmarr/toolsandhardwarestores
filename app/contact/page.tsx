import React from 'react'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Building2,
  Navigation,
} from 'lucide-react'
import { getContactSettings } from '@/lib/getSettings'
import { prisma } from '@/lib/db'
import ContactEmailForm from '@/components/ContactEmailForm'
import StoreLocatorClient from '@/components/StoreLocatorClient'
import WhatsAppIcon from '@/components/WhatsAppIcon'

export const revalidate = 60

export default async function ContactPage() {
  const settings = await getContactSettings()

  // Fetch all store locations from DB
  const storeLocations = await prisma.storeLocation.findMany({
    orderBy: { isPrimary: 'desc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 pb-24">
      {/* 1. HERO HEADER */}
      <div className="border-b border-slate-200 pb-10 space-y-4">
        <div className="text-xs font-black uppercase tracking-widest text-red-600">
          We Are Here to Assist Your Project
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
          Contact Our Industrial Tool Specialists
        </h1>
        <p className="text-slate-600 max-w-2xl text-sm sm:text-base leading-relaxed">
          Whether you need wholesale contractor pricing, armature spare fitment advice, or urgent
          in-store workshop support, reach out to our industrial headquarters or visit our nearest
          branch.
        </p>

        {/* Quick Contact Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Direct Consultation</div>
              <a
                href={`tel:${settings.primaryPhone.replace(/[^0-9+]/g, '')}`}
                className="text-sm font-bold text-slate-900 hover:text-red-600 transition"
              >
                {settings.primaryPhone}
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Wholesale Email</div>
              <a
                href={`mailto:${settings.primaryEmail}`}
                className="text-sm font-bold text-slate-900 hover:text-red-600 transition truncate block max-w-[200px]"
              >
                {settings.primaryEmail}
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">WhatsApp Direct</div>
              <a
                href={`https://wa.me/${settings.primaryPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  'Hello Tools & Hardware Stores, I need industrial tool consultation.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-emerald-700 hover:underline"
              >
                Instant Quotation →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HEADQUARTERS ADDRESS & INTERACTIVE EMAIL FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Address & Store Hours */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-5 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-500" />
              <span>Flagship Showroom & Support Hub</span>
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-slate-700 leading-relaxed font-medium">
                  Ranigunj HQ • Secunderabad & Hyderabad Industrial Supply
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 font-semibold">
                <span>Ready Store Counter Pickup & Direct Supply</span>
              </div>
            </div>

            {/* Hours Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                Showroom Operating Hours
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Monday – Saturday:</span>
                <span className="font-bold">9:30 AM – 8:30 PM</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 border-t border-slate-200 pt-1">
                <span>Sunday:</span>
                <span className="font-bold text-red-500">10:00 AM – 2:00 PM</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  settings.addressText
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Navigation className="w-4 h-4 text-red-400" />
                <span>Open in Google Maps / GPS</span>
              </a>

              <a
                href={`https://wa.me/${settings.primaryPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  'Hello, I would like to visit your store today.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Enquire on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Contact Form (Nodemailer SMTP API) */}
        <div className="lg:col-span-7">
          <ContactEmailForm />
        </div>
      </div>

      {/* 3. MULTI-STORE GPS LOCATOR */}
      <div id="locator" className="pt-8 border-t border-slate-200">
        <StoreLocatorClient storeLocations={storeLocations} />
      </div>
    </div>
  )
}
