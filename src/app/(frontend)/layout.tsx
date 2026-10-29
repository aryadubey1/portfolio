import type { Metadata, Viewport } from 'next'
import { Syne, Figtree, JetBrains_Mono } from 'next/font/google'
import React from 'react'
import { Sky } from '@/components/Sky'
import { Atmosphere } from '@/components/Atmosphere'
import { Whale } from '@/components/Whale'
import { Chrome } from '@/components/Chrome'
import { Footer } from '@/components/Footer'
import { PREFS_SCRIPT } from '@/components/Prefs'
import { getSite } from '@/lib/data'
import './globals.css'
import './sections.css'

const syne = Syne({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-syne', display: 'swap' })
const figtree = Figtree({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--font-figtree', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aryadubey.tech'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Arya Dubey: websites, apps and automations, built and launched', template: '%s · Arya Dubey' },
  description:
    'Websites, web and mobile apps, dashboards and automations for businesses and founders. Designed, built, launched and looked after. See live work and get a quote.',
  applicationName: 'aryadubey.tech',
  authors: [{ name: 'Arya Dubey', url: SITE_URL }],
  openGraph: { type: 'website', siteName: 'Arya Dubey', url: SITE_URL },
  twitter: { card: 'summary_large_image', creator: '@_aryadubey' },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfaf7' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0d17' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite()
  return (
    <html lang="en" className={`${syne.variable} ${figtree.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Sky />
        <Whale />
        <div className="grain" aria-hidden="true" />
        <Atmosphere />
        <div className="page">
          <Chrome socials={site.socials} />
          <main id="main">{children}</main>
          <Footer socials={site.socials} />
        </div>
      </body>
    </html>
  )
}
