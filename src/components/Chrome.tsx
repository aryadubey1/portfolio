'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Compass, G, Glyph } from './Drawings'
import { Prefs } from './Prefs'

const LINKS = [
  { href: '/#map', label: 'The map', sub: 'Islands I’ve charted' },
  { href: '/#currents', label: 'What I make', sub: 'Whatever the idea needs' },
  { href: '/#voyage', label: 'How it goes', sub: 'From idea to live' },
  { href: '/#questions', label: 'Questions', sub: 'Ask away' },
]

/* Top bar (all screens) + bottom dock and chart sheet (phones). */
export function Chrome({ socials }: { socials: { label: string; url: string }[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const sheetRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    const first = sheetRef.current?.querySelector<HTMLElement>('a,button')
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab' && sheetRef.current) {
        const f = Array.from(sheetRef.current.querySelectorAll<HTMLElement>('a,button'))
        if (!f.length) return
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus() }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      lenis?.start()
      openerRef.current?.focus()
    }
  }, [open])

  return (
    <>
      <header className="bar">
        <div className="wrap bar-in">
          <Link href="/" className="brand" aria-label="Arya Dubey, home">
            <Compass size={30} className="brand-mark" />
            <span>Arya Dubey</span>
          </Link>
          <nav className="bar-nav" aria-label="Main">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </nav>
          <Prefs />
          <Link href="/#quote" className="btn bar-cta">
            Get a quote <span className="arr"><Glyph d={G.arrow} size={18} /></span>
          </Link>
        </div>
      </header>

      <div className="dock" role="navigation" aria-label="Quick">
        <button ref={openerRef} type="button" className="dock-chart" aria-expanded={open} aria-controls="chart-sheet" onClick={() => setOpen(true)}>
          <Compass size={34} />
          <span>Chart</span>
        </button>
        <Link href="/#quote" className="btn dock-cta">
          Get a quote <span className="arr"><Glyph d={G.arrow} size={18} /></span>
        </Link>
      </div>

      <div className={`sheet-veil${open ? ' on' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <div
        id="chart-sheet"
        ref={sheetRef}
        className={`chart-sheet${open ? ' on' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Chart: where to go"
        hidden={!open}
        data-no-drop
      >
        <div className="cs-grab" aria-hidden="true" />
        <div className="cs-head">
          <p className="eyebrow">Chart</p>
          <button type="button" className="cs-x" onClick={() => setOpen(false)} aria-label="Close">
            <Glyph d={G.close} size={20} />
          </button>
        </div>
        <ul className="cs-links">
          {LINKS.map((l, i) => (
            <li key={l.href} style={{ ['--i' as string]: i }}>
              <Link href={l.href} onClick={() => setOpen(false)}>
                <span className="cs-n">0{i + 1}</span>
                <span className="cs-t">{l.label}<small>{l.sub}</small></span>
                <Glyph d={G.arrow} size={18} />
              </Link>
            </li>
          ))}
        </ul>
        <Prefs labelled />
        <div className="cs-social">
          {socials.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
          ))}
        </div>
      </div>
    </>
  )
}
