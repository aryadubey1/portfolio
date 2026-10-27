'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendTelegram } from '@/lib/telegram'

export type QuoteState = { ok: true } | { ok: false; error: string } | null

/* ---------- a small in-memory rate limit: 5 requests per IP per 10 minutes ---------- */
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k)
  }
  return false
}

/* strip control characters (keeps newlines and tabs), trim */
const clean = (v: FormDataEntryValue | null) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const looksLikeContact = (v: string) => EMAIL.test(v) || v.replace(/\D/g, '').length >= 7

type Lead = {
  name: string
  contact: string
  islandName: string
  making: string
  stage: string
  timing: string
  idea: string
}

function message(d: Lead): string {
  const lines = ['🧭 New idea charted on aryadubey.tech', '', `Idea: ${d.islandName || '(no name yet)'}`]
  if (d.making) lines.push(`Making: ${d.making}`)
  if (d.stage) lines.push(`Stage: ${d.stage}`)
  if (d.timing) lines.push(`When: ${d.timing}`)
  lines.push('', `From: ${d.name}`, `Reach: ${d.contact}`, '', d.idea)
  return lines.join('\n')
}

export async function submitQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  // honeypot: bots fill every field, people never see this one
  if (clean(formData.get('website'))) return { ok: true }

  const ideaRaw = clean(formData.get('idea'))
  const lead: Lead = {
    name: clean(formData.get('name')).slice(0, 120),
    contact: clean(formData.get('contact')).slice(0, 160),
    islandName: clean(formData.get('islandName')).slice(0, 120),
    making: clean(formData.get('making')).slice(0, 300),
    stage: clean(formData.get('stage')).slice(0, 300),
    timing: clean(formData.get('timing')).slice(0, 300),
    idea: ideaRaw.slice(0, 4000),
  }

  if (!lead.name || !lead.contact || !lead.idea) {
    return { ok: false, error: 'Please add your name, how to reach you, and a few words about the idea.' }
  }
  if (!looksLikeContact(lead.contact)) {
    return { ok: false, error: "That doesn't look like an email or a phone number. Mind checking it?" }
  }
  if (ideaRaw.length < 10) {
    return { ok: false, error: 'Tell me a little more about the idea. A sentence or two is plenty.' }
  }
  if (ideaRaw.length > 4000) {
    return { ok: false, error: "That's a lot to take in at once. Please keep it under 4,000 characters and we can go deeper on a call." }
  }

  const h = await headers()
  // nginx sets X-Real-IP from the socket; the first X-Forwarded-For entry is client-controlled
  const ip = (h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',').pop() || 'unknown').trim()
  if (rateLimited(ip)) {
    return { ok: false, error: "You've sent a few already. Give it a few minutes and try again." }
  }

  // save first; if the database is down, the Telegram alert still carries the idea
  let payload: Awaited<ReturnType<typeof getPayload>> | null = null
  let id: string | number | null = null
  try {
    payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'leads',
      data: { ...lead, notified: false },
      overrideAccess: true,
    })
    id = doc.id
  } catch (err) {
    console.error('[quote] could not save lead', err)
  }

  const sent = await sendTelegram(message(lead))
  if (sent && payload && id !== null) {
    try {
      await payload.update({ collection: 'leads', id, data: { notified: true }, overrideAccess: true })
    } catch (err) {
      console.error('[quote] could not mark lead notified', err)
    }
  }

  if (id === null && !sent) {
    return { ok: false, error: "Something went wrong on my side and your idea didn't go through. Please try again in a minute." }
  }
  return { ok: true }
}
