'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { pigmentFor, sized } from '@/lib/atlas'
import type { Island } from '@/lib/data'

const motionAllowed = () => {
  const m = document.documentElement.dataset.motion
  if (m === 'on') return true
  if (m === 'off') return false
  return !matchMedia('(prefers-reduced-motion: reduce)').matches
}

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const host = (p: Island) => {
  try {
    return p.liveUrl ? new URL(p.liveUrl).host : `aryadubey.tech/work/${p.slug}`
  } catch {
    return p.slug
  }
}

function Shots({ items, w, pos }: { items: Island[]; w: number; pos: string }) {
  return (
    <>
      {items.map((p, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={p.slug} className="sc-shot" data-k={k} src={sized(p.cover!, w)} alt="" loading="lazy" decoding="async" style={{ objectPosition: pos }} />
      ))}
    </>
  )
}

/* "Live work, in motion" — a stage that stays put while scrolling scrubs it like a
   video: real project screens float in on a laptop and a phone, zoom, then hand over
   to the next project. With motion off it is a plain list of the same screens. */
export function Scenes({ islands }: { islands: Island[] }) {
  const items = islands.filter((p) => p.cover).slice(0, 4)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const n = items.length
    const shots = (sel: string) => Array.from(el.querySelectorAll<HTMLElement>(`${sel} .sc-shot`))
    const lap = shots('.sc-laptop'), phone = shots('.sc-phone')
    const caps = Array.from(el.querySelectorAll<HTMLElement>('.sc-cap'))
    const glows = Array.from(el.querySelectorAll<HTMLElement>('.sc-glow'))
    const ticks = Array.from(el.querySelectorAll<HTMLElement>('.sc-tick'))
    const rig = el.querySelector<HTMLElement>('.sc-devices')
    const url = el.querySelector<HTMLElement>('.sc-url')
    const hosts = url?.dataset.hosts?.split(' ') ?? []
    let raf = 0

    const frame = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const span = r.height - innerHeight
      const p = span > 0 ? clamp(-r.top / span) : 0
      const enter = ease(clamp((innerHeight - r.top) / innerHeight))
      if (rig) rig.style.transform = `translateY(${(1 - enter) * 60}px) scale(${0.9 + 0.1 * enter})`
      const at = p * n
      if (url) url.textContent = hosts[Math.min(n - 1, Math.floor(at))] ?? ''
      for (let k = 0; k < n; k++) {
        const u = at - k // 0 → 1 while project k holds the stage
        const fadeIn = k === 0 ? 1 : clamp((u + 0.12) / 0.24)
        const fadeOut = k === n - 1 ? 1 : clamp((1.12 - u) / 0.24)
        const o = fadeIn * fadeOut
        const z = clamp(u)
        lap[k].style.opacity = phone[k].style.opacity = glows[k].style.opacity = String(o)
        lap[k].style.transform = `scale(${1.02 + 0.08 * z}) translateY(${-4 * z}%)`
        phone[k].style.transform = `scale(${1.04 + 0.06 * z}) translateY(${-8 * z}%)`
        caps[k].style.opacity = String(o)
        caps[k].style.transform = `translateY(${(1 - o) * (u < 0.5 ? 18 : -18)}px)`
        caps[k].toggleAttribute('data-on', o > 0.5)
        ticks[k].toggleAttribute('data-on', o > 0.5)
      }
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const sync = () => {
      const on = motionAllowed()
      el.toggleAttribute('data-on', on)
      if (on) kick()
    }

    sync()
    addEventListener('scroll', kick, { passive: true })
    addEventListener('resize', kick, { passive: true })
    const mo = new MutationObserver(sync)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
    return () => {
      removeEventListener('scroll', kick)
      removeEventListener('resize', kick)
      mo.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [items.length])

  if (items.length < 2) return null

  return (
    <section ref={ref} id="scenes" className="scenes" style={{ '--n': items.length } as React.CSSProperties} aria-labelledby="sc-h">
      <div className="sc-stage">
        <div className="wrap sc-grid">
          <div className="sc-head">
            <p className="eyebrow">Live work, in motion</p>
            <h2 id="sc-h" className="h-sec sc-title">Real products, <em>running</em>.</h2>
          </div>

          <div className="sc-devices" aria-hidden="true">
            {items.map((p) => (
              <span key={p.slug} className="sc-glow" style={{ '--g': pigmentFor(p.slug, p.pigment) } as React.CSSProperties} />
            ))}
            <div className="sc-laptop">
              <div className="sc-bar"><i /><i /><i /><span className="sc-url" data-hosts={items.map(host).join(' ')}>{host(items[0])}</span></div>
              <div className="sc-screen"><Shots items={items} w={1300} pos="center top" /></div>
            </div>
            <div className="sc-phone">
              <div className="sc-screen"><Shots items={items} w={600} pos="center top" /></div>
            </div>
          </div>

          <ol className="sc-caps">
            {items.map((p, k) => (
              <li key={p.slug} className="sc-cap">
                <span className="sc-num">{String(k + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
                <span className="sc-name nm">{p.title}</span>
                <span className="sc-tag">{p.tagline}</span>
                <Link href={`/work/${p.slug}`} className="sc-link">See how it was built →</Link>
              </li>
            ))}
          </ol>

          <div className="sc-ticks" aria-hidden="true">
            {items.map((p) => <span key={p.slug} className="sc-tick" />)}
          </div>
        </div>
      </div>
    </section>
  )
}
