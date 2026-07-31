import React from 'react'
import Link from 'next/link'
import {
  Wrench,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  ShieldCheck,
  Award,
  Truck,
} from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'
import { getWhatsAppInquiryUrl } from '@/lib/whatsapp'

interface FooterProps {
  primaryPhone: string
  addressText: string
  primaryEmail: string
}

export default function Footer({
  primaryPhone,
  addressText,
  primaryEmail,
}: FooterProps) {
  const waUrl = getWhatsAppInquiryUrl({
    phone: primaryPhone,
    itemName: 'General Website Inquiry',
    itemType: 'General Consultation',
    extraNotes: 'Visiting from Footer Section',
  })

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 text-sm mt-auto">
      {/* Top Value Propositions Banner */}
      <div className="bg-slate-950 border-b border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-red-500 fill-red-500" />
              </div>
              <div>
                <h4 className="text-white font-extrabold">4.9★ Customer Rating</h4>
                <p className="text-xs text-slate-400">
                  Based on 379+ verified customer reviews
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-extrabold">Core Brand Distributor</h4>
                <p className="text-xs text-slate-400">
                  Bosch, DeWalt, Hitachi (Hikoki) & Makita
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h4 className="text-white font-extrabold">Wholesale & Retail Supply</h4>
                <p className="text-xs text-slate-400">
                  Ready counter stock & store pickup in Secunderabad
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-extrabold">In-Store Counter Support</h4>
                <p className="text-xs text-slate-400">
                  Expert guidance for contractors & industrial plants
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Store Overview */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-slate-700 shadow-sm flex items-center justify-center p-1 shrink-0">
                <img
                  src="/logo-whitebg.png"
                  alt="Tools & Hardware Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-extrabold text-lg text-white tracking-tight">
                  TOOLS & HARDWARE STORES
                </div>
                <div className="text-xs text-red-400 font-bold uppercase tracking-wider">
                  Industrial Power Tools & Spares
                </div>
              </div>
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              The premier wholesale and multi-brand retail establishment for industrial power tools,
              heavy machinery, ringsaw cutters, and replacement spares.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{addressText}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{primaryPhone} (Wholesale & Retail Consultation)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-red-400 shrink-0" />
                <span>{primaryEmail}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Core & Specialty Brands */}
          <div>
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              Distributor Brands
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/brands/bosch" className="hover:text-red-400 transition">
                  Bosch Professional
                </Link>
              </li>
              <li>
                <Link href="/brands/dewalt" className="hover:text-red-400 transition">
                  DeWalt Guaranteed Tough
                </Link>
              </li>
              <li>
                <Link href="/brands/hitachi-hikoki" className="hover:text-red-400 transition">
                  Hitachi (Hikoki)
                </Link>
              </li>
              <li>
                <Link href="/brands/makita" className="hover:text-red-400 transition">
                  Makita Industrial
                </Link>
              </li>
              <li className="pt-2 text-xs font-bold text-slate-500 uppercase">
                Specialty Professional
              </li>
              <li>
                <Link href="/brands/powerbilt" className="hover:text-red-400 transition">
                  Powerbilt Ringsaw Machines
                </Link>
              </li>
              <li>
                <Link href="/brands/powermatic" className="hover:text-red-400 transition">
                  Powermatic Compressors
                </Link>
              </li>
              <li>
                <Link href="/brands/iron-king" className="hover:text-red-400 transition">
                  Iron King Hardware
                </Link>
              </li>
              <li>
                <Link href="/brands/check-mate" className="hover:text-red-400 transition">
                  Check Mate Laser Levels
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories & Spares */}
          <div>
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              Tool Categories
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categories/power-tools" className="hover:text-red-400 transition">
                  Power Tools
                </Link>
              </li>
              <li>
                <Link href="/categories/heavy-machinery" className="hover:text-red-400 transition">
                  Heavy Machinery
                </Link>
              </li>
              <li>
                <Link href="/categories/ringsaw-specialty-equipment" className="hover:text-red-400 transition">
                  Ringsaw & Specialty Equipment
                </Link>
              </li>
              <li>
                <Link href="/categories/hand-tools-measuring" className="hover:text-red-400 transition">
                  Hand Tools & Measuring
                </Link>
              </li>
              <li>
                <Link href="/spares" className="hover:text-red-400 transition font-bold text-red-300">
                  Genuine Spare Parts & Armatures
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Store Hours & WhatsApp Enquiry */}
          <div>
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              Operating Hours
            </h3>
            <div className="space-y-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold">Monday – Saturday</div>
                  <div className="text-slate-300">9:30 AM – 8:30 PM</div>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-slate-700">
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold">Sunday</div>
                  <div className="text-slate-300">10:00 AM – 2:00 PM</div>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Enquire on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & multi-store quick link */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Tools & Hardware Stores. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-300 transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition">
              Contact Us
            </Link>
            <Link href="/admin" className="hover:text-slate-300 transition">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
