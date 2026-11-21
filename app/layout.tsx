import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ToastProvider from '@/components/ToastProvider'
import { getContactSettings } from '@/lib/getSettings'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tools & Hardware Stores | Wholesale & Retail Industrial Equipment',
  description:
    'Authorized wholesale & retail supplier for Powerbilt, DongCheng, Bosch, Checkmate, Tewort, Powermatic, Iron King power tools, machinery, and genuine factory spare parts in Ranigunj, Secunderabad.',
  keywords: [
    'Tools & Hardware Stores',
    'Industrial Hardware Wholesale',
    'Ranigunj Secunderabad Power Tools',
    'Powerbilt tools & spares',
    'DongCheng power tools',
    'Bosch power tools dealer',
    'Checkmate Tewort Powermatic Iron King',
    'armatures rotors spares online',
  ],
  icons: {
    icon: '/logo-whitebg.png',
    apple: '/logo-whitebg.png',
    shortcut: '/logo-whitebg.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getContactSettings()

  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-slate-900 selection:bg-red-600 selection:text-white">
        <ToastProvider />
        <Navbar
          primaryPhone={settings.primaryPhone}
          addressText={settings.addressText}
        />
        <main className="flex-1">{children}</main>
        <Footer
          primaryPhone={settings.primaryPhone}
          addressText={settings.addressText}
          primaryEmail={settings.primaryEmail}
        />
      </body>
    </html>
  )
}
