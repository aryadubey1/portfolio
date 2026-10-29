import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { FAQ_DEFAULTS, PROJECT_SEED, SITE_DEFAULTS, type SiteWords } from './content'
import type { IsleStatus } from './atlas'

export type Island = {
  id: string
  title: string
  slug: string
  tagline: string
  category: string
  status: IsleStatus
  icon: string
  pigment: string | null
  summary: string
  cover: string | null
  liveUrl: string | null
  stack: string[]
  highlights: string[]
  story: { problem: string; approach: string; outcome: string }
  featured: boolean
}

export const payloadClient = cache(() => getPayload({ config }))

const mediaUrl = (m: unknown): string | null => {
  if (!m || typeof m !== 'object') return null
  const o = m as { url?: string | null; sizes?: { wide?: { url?: string | null } } }
  return o.sizes?.wide?.url || o.url || null
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const toIsland = (p: any): Island => ({
  id: String(p.id ?? p.slug),
  title: p.title,
  slug: p.slug,
  tagline: p.tagline || '',
  category: p.category || '',
  status: p.status === 'building' ? 'building' : 'live',
  icon: p.icon || 'flag',
  pigment: p.pigment || null,
  summary: p.summary || '',
  cover: mediaUrl(p.cover) || p.coverUrl || null,
  liveUrl: p.liveUrl || null,
  stack: (p.stack || []).map((s: any) => (typeof s === 'string' ? s : s.name)).filter(Boolean),
  highlights: (p.highlights || []).map((s: any) => (typeof s === 'string' ? s : s.text)).filter(Boolean),
  story: { problem: p.story?.problem || '', approach: p.story?.approach || '', outcome: p.story?.outcome || '' },
  featured: p.featured !== false,
})

const fallbackIslands = () => PROJECT_SEED.map((p) => toIsland({ ...p, id: p.slug }))

export const getIslands = cache(async (): Promise<Island[]> => {
  try {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'projects', sort: 'order', limit: 200, depth: 1 })
    return res.docs.map(toIsland)
  } catch (e) {
    console.error('[data] projects fell back to defaults:', (e as Error).message)
    return fallbackIslands()
  }
})

export const getIsland = cache(async (slug: string): Promise<Island | null> => {
  const all = await getIslands()
  return all.find((p) => p.slug === slug) || null
})

export const getSite = cache(async (): Promise<SiteWords> => {
  try {
    const payload = await payloadClient()
    const s: any = await payload.findGlobal({ slug: 'site' })
    const lines = (s.heroLines || []).map((l: any) => l.line).filter(Boolean)
    return {
      heroEyebrow: s.heroEyebrow || SITE_DEFAULTS.heroEyebrow,
      heroLines: lines.length ? lines : SITE_DEFAULTS.heroLines,
      heroIntro: s.heroIntro || SITE_DEFAULTS.heroIntro,
      makes: s.makes?.length ? s.makes.map((m: any) => ({ label: m.label, icon: m.icon || 'flag' })) : SITE_DEFAULTS.makes,
      process: s.process?.length ? s.process.map((p: any) => ({ title: p.title, text: p.text })) : SITE_DEFAULTS.process,
      email: s.email || null,
      whatsapp: s.whatsapp || null,
      bookingUrl: s.bookingUrl || null,
      socials: s.socials?.length ? s.socials.map((x: any) => ({ label: x.label, url: x.url })) : SITE_DEFAULTS.socials,
    }
  } catch (e) {
    console.error('[data] site words fell back to defaults:', (e as Error).message)
    return SITE_DEFAULTS
  }
})

export const getFaqs = cache(async (): Promise<{ question: string; answer: string }[]> => {
  try {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'faqs', sort: 'order', limit: 50 })
    return res.docs.length ? res.docs.map((f: any) => ({ question: f.question, answer: f.answer })) : FAQ_DEFAULTS
  } catch {
    return FAQ_DEFAULTS
  }
})
/* eslint-enable @typescript-eslint/no-explicit-any */

/* Is the island's public link answering? Cached with the page (ISR). */
export async function isAfloat(url: string | null): Promise<boolean> {
  if (!url) return false
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(3500),
      next: { revalidate: 300 },
    })
    if (res.status === 405 || res.status === 501) {
      const g = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(3500), next: { revalidate: 300 } })
      return g.status < 400
    }
    return res.status < 400
  } catch {
    return false
  }
}
