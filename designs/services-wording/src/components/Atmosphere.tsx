'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const motionAllowed = () => {
  const m = document.documentElement.dataset.motion
  if (m === 'on') return true
  if (m === 'off') return false
  return !matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* Smooth scrolling, scroll reveals and pointer parallax for the whole site. */
export function Atmosphere() {
  const pathname = usePathname()

  /* Lenis, re-created whenever the motion preference flips */
  useEffect(() => {
    let lenis: Lenis | null = null
    let tick: ((t: number) => void) | null = null
    const start = () => {
      if (lenis || !motionAllowed()) return
      lenis = new Lenis({ anchors: { offset: -84 }, lerp: 0.11, wheelMultiplier: 1 })
      lenis.on('scroll', ScrollTrigger.update)
      tick = (t: number) => lenis?.raf(t * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    }
    const stop = () => {
      if (tick) gsap.ticker.remove(tick)
      lenis?.destroy()
      lenis = null
      tick = null
      ;(window as unknown as { __lenis?: Lenis }).__lenis = undefined
    }
    const apply = () => (motionAllowed() ? start() : stop())
    apply()
    window.addEventListener('atlas:prefs', apply)
    return () => {
      window.removeEventListener('atlas:prefs', apply)
      stop()
    }
  }, [])

  /* reveal-on-scroll for every .rv element, including ones that mount later */
  useEffect(() => {
    const root = document.documentElement
    ;(window as unknown as { __atlasReady?: boolean }).__atlasReady = true
    if (!('IntersectionObserver' in window)) {
      root.classList.add('no-reveal')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            ;(en.target as HTMLElement).dataset.in = ''
            io.unobserve(en.target)
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 },
    )
    const watch = (scope: ParentNode) =>
      scope.querySelectorAll<HTMLElement>('.rv:not([data-in])').forEach((e) => io.observe(e))
    watch(document)
    const mo = new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => n instanceof HTMLElement && (n.matches('.rv') ? io.observe(n) : watch(n)))
    })
    mo.observe(document.body, { childList: true, subtree: true })
    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  /* --mx / --my: gentle parallax from the mouse (never on touch) */
  useEffect(() => {
    const root = document.documentElement
    let queued = false, x = 0, y = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      x = e.clientX
      y = e.clientY
      if (queued || !motionAllowed()) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        root.style.setProperty('--mx', ((x / innerWidth) * 2 - 1).toFixed(3))
        root.style.setProperty('--my', ((y / innerHeight) * 2 - 1).toFixed(3))
        const n = document.getElementById('needle')
        if (n) {
          const r = n.getBoundingClientRect()
          const a = (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI + 90
          n.style.setProperty('--na', `${a.toFixed(1)}deg`)
        }
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return null
}
