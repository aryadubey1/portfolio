'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { curve, isleStyle, sized } from '@/lib/atlas'
import type { Island } from '@/lib/data'
import { Emblem } from './Emblem'
import { Boat, G, Glyph } from './Drawings'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

export type MapIsland = Island & { afloat: boolean }

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect

const motionAllowed = () => {
  const m = document.documentElement.dataset.motion
  if (m === 'on') return true
  if (m === 'off') return false
  return !matchMedia('(prefers-reduced-motion: reduce)').matches
}

function IsleCard({ p, i, onDive }: { p: MapIsland; i: number; onDive: (e: React.MouseEvent, href: string) => void }) {
  const href = `/work/${p.slug}`
  return (
    <Link href={href} className={`isle s-${p.status}`} style={isleStyle(p.slug, i)} onClick={(e) => onDive(e, href)} data-no-drop>
      <span className="isle-shadow" aria-hidden="true" />
      <span className="isle-float">
        <span className="isle-body">
          {p.cover && (
            <span className="isle-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sized(p.cover, 900)}
                srcSet={`${sized(p.cover, 600)} 600w, ${sized(p.cover, 900)} 900w, ${sized(p.cover, 1300)} 1300w`}
                sizes="(min-width: 900px) 560px, 92vw"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </span>
          )}
          <span className="isle-top">
            <Emblem id={p.slug} status={p.status} icon={p.icon} pigment={p.pigment} size={58} />
            <span className="isle-id">
              <span className="nm">{p.title}</span>
              <span className="isle-meta">
                {p.category && <span className="pill p-idea">{p.category}</span>}
                {p.afloat ? (
                  <span className="pill p-live"><span className="dot live" aria-hidden="true" /> live</span>
                ) : p.status === 'building' ? (
                  <span className="pill p-building">taking shape</span>
                ) : null}
              </span>
            </span>
          </span>
          <span className="about">{p.summary}</span>
          {p.stack.length > 0 && (
            <span className="mods" aria-label="Tools used">
              {p.stack.slice(0, 5).map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
              {p.stack.length > 5 && <span className="chip">+{p.stack.length - 5}</span>}
            </span>
          )}
          <span className="isle-go">
            Land on this island <Glyph d={G.arrow} size={16} />
          </span>
        </span>
      </span>
    </Link>
  )
}

export function Voyage({ islands }: { islands: MapIsland[] }) {
  const router = useRouter()
  const sea = useRef<HTMLDivElement>(null)
  const route = useRef<SVGPathElement>(null)
  const sailed = useRef<SVGPathElement>(null)
  const boat = useRef<HTMLDivElement>(null)
  const [geo, setGeo] = useState<{ w: number; h: number; d: string; ports: [number, number, number][] }>({ w: 0, h: 0, d: '', ports: [] })

  /* chart the lane: a wavy line down the sea, with a port beside every island */
  useIso(() => {
    const el = sea.current
    if (!el) return
    const measure = () => {
      const box = el.getBoundingClientRect()
      const wide = window.matchMedia('(min-width: 900px)').matches
      const laneX = wide ? box.width / 2 : 14
      const cards = Array.from(el.querySelectorAll<HTMLElement>('.isle-slot'))
      const ports: [number, number, number][] = cards.map((c, k) => {
        const r = c.getBoundingClientRect()
        const y = r.top - box.top + Math.min(70, r.height * 0.25)
        const side = wide ? (r.left + r.width / 2 < box.left + laneX ? -1 : 1) : 1
        const sway = wide ? 34 * side : k % 2 ? 6 : -4
        return [laneX + sway, y, side]
      })
      const pts: [number, number][] = [[laneX, 0], ...ports.map(([x, y]) => [x, y] as [number, number]), [laneX, box.height]]
      setGeo({ w: box.width, h: box.height, d: curve(pts), ports })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [islands.length])

  /* sail: the boat follows the lane with scroll, the wake fills in behind it */
  useEffect(() => {
    const el = sea.current, path = route.current, wake = sailed.current, b = boat.current
    if (!el || !path || !wake || !b || !geo.d) return
    const len = path.getTotalLength()
    wake.style.strokeDasharray = `${len}`
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.isle-slot'))

    if (!motionAllowed()) {
      wake.style.strokeDashoffset = '0'
      gsap.set(b, { motionPath: { path, align: path, alignOrigin: [0.5, 0.85], start: 1, end: 1 } })
      cards.forEach((c) => c.classList.add('lit'))
      return
    }

    const ctx = gsap.context(() => {
      gsap.to(b, {
        motionPath: { path, align: path, alignOrigin: [0.5, 0.85], autoRotate: false },
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 62%',
          end: 'bottom 62%',
          scrub: 0.8,
          onUpdate: (st) => {
            wake.style.strokeDashoffset = `${len * (1 - st.progress)}`
          },
        },
      })
      cards.forEach((c) =>
        ScrollTrigger.create({ trigger: c, start: 'top 66%', onEnter: () => c.classList.add('lit'), onLeaveBack: () => c.classList.remove('lit') }),
      )
    }, el)
    return () => ctx.revert()
  }, [geo.d])

  useEffect(() => {
    const re = () => ScrollTrigger.refresh()
    window.addEventListener('atlas:prefs', re)
    return () => window.removeEventListener('atlas:prefs', re)
  }, [])

  /* dive into an island: ink drop where you tapped, the card swells, then the page changes */
  const onDive = (e: React.MouseEvent, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || !motionAllowed()) return
    e.preventDefault()
    const card = (e.currentTarget as HTMLElement)
    window.dispatchEvent(new CustomEvent('sky:drop', { detail: { x: e.clientX, y: e.clientY, accent: true } }))
    card.classList.add('diving')
    document.documentElement.classList.add('is-diving')
    router.prefetch(href)
    window.setTimeout(() => {
      router.push(href)
      window.setTimeout(() => document.documentElement.classList.remove('is-diving'), 500)
    }, 420)
  }

  return (
    <section id="map" className="map" aria-labelledby="map-h">
      <div className="wrap">
        <header className="map-head rv">
          <p className="eyebrow">The map so far</p>
          <h2 id="map-h" className="h-sec">Islands I’ve charted.</h2>
          <p className="lead">Every island is something I designed, built and shipped. Tap one to land on it.</p>
        </header>

        <div className="sea" ref={sea}>
          <svg className="lane" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w || 1} ${geo.h || 1}`} aria-hidden="true">
            <path ref={route} className="lane-rt" d={geo.d} />
            <path ref={sailed} className="lane-wake" d={geo.d} />
            {geo.ports.map(([x, y, side], k) => (
              <g key={k}>
                <path className="lane-spur" d={`M${x} ${y}h${side * 46}`} />
                <circle className="lane-port" cx={x} cy={y} r="5.5" />
              </g>
            ))}
          </svg>
          <div className="lane-boat" ref={boat} aria-hidden="true">
            <Boat size={42} className="rock" />
          </div>

          <ol className="isles">
            {islands.map((p, i) => (
              <li key={p.slug} className="isle-slot rv" style={{ ['--rv' as string]: i % 2 }}>
                <IsleCard p={p} i={i} onDive={onDive} />
              </li>
            ))}
            <li className="isle-slot rv">
              <a href="#quote" className="isle s-idea isle-open" data-no-drop>
                <span className="isle-float">
                  <span className="isle-body">
                    <span className="isle-top">
                      <Emblem id="your-idea" status="idea" icon="question" size={58} />
                      <span className="isle-id">
                        <span className="nm">Your idea</span>
                        <span className="pill p-idea">uncharted</span>
                      </span>
                    </span>
                    <span className="about">This spot on the map is free. Tell me what you’d like to build and it becomes the next island.</span>
                    <span className="isle-go">
                      Chart it <Glyph d={G.arrow} size={16} />
                    </span>
                  </span>
                </span>
              </a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
