'use client'

import { useEffect, useRef } from 'react'

const motionAllowed = () => {
  const m = document.documentElement.dataset.motion
  if (m === 'on') return true
  if (m === 'off') return false
  return !matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* A whale swimming under the page. Scroll is its timeline, like scrubbing a video:
   it crosses the sea, turns, dives deep and surfaces again as you read down.
   Eased toward the scroll position so it glides instead of jumping. */
export function Whale() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0, p = -1, shown = false
    const max = () => Math.max(1, document.documentElement.scrollHeight - innerHeight)

    const frame = () => {
      raf = 0
      const goal = Math.min(1, window.scrollY / max())
      p = p < 0 ? goal : p + (goal - p) * 0.08
      const vw = innerWidth, vh = innerHeight
      const a = p * Math.PI * 3 // three crossings over the whole page
      const x = 0.5 + 0.38 * Math.sin(a)
      const y = 0.16 + 0.62 * p + 0.06 * Math.sin(a * 2)
      const dx = Math.cos(a), dy = 0.62 / (Math.PI * 3) + 0.12 * Math.cos(a * 2)
      const depth = 0.5 + 0.5 * Math.cos(a) * Math.cos(a) // nearest when crossing mid-screen
      const s = (vw < 760 ? 0.55 : 1) * (0.7 + 0.35 * depth)
      const tilt = Math.max(-18, Math.min(18, (Math.atan2(dy, Math.abs(dx) + 0.05) * 180) / Math.PI))
      el.style.transform = `translate3d(${(x * vw).toFixed(1)}px, ${(y * vh).toFixed(1)}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)}) scaleX(${dx < 0 ? -1 : 1}) rotate(${tilt.toFixed(1)}deg)`
      el.style.opacity = (0.35 + 0.4 * depth).toFixed(3)
      if (!shown) {
        shown = true
        el.dataset.on = ''
      }
      if (Math.abs(goal - p) > 0.0005) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const apply = () => {
      el.hidden = !motionAllowed()
      kick()
    }
    apply()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)
    window.addEventListener('atlas:prefs', apply)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', kick)
      window.removeEventListener('atlas:prefs', apply)
    }
  }, [])

  return (
    <div className="whale" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 320 150" width="320" height="150">
        <g className="wh-tail">
          <path className="wh-skin" d="M58 78C44 76 30 70 16 56c-4 10-2 22 6 30-8 8-10 20-6 30 14-14 28-20 42-22z" />
        </g>
        <path className="wh-skin" d="M56 80c26-26 82-44 140-42 52 2 96 20 112 46 6 10-2 20-16 26-34 14-90 22-140 18-44-4-78-20-96-34z" />
        <path className="wh-belly" d="M120 112c40 10 104 10 156-6M128 102c40 8 98 8 146-6M140 93c34 5 84 4 128-8" />
        <g className="wh-fin">
          <path className="wh-skin" d="M186 106c-6 18-22 32-42 36 12-12 18-26 18-40z" />
        </g>
        <circle className="wh-eye" cx="262" cy="86" r="3" />
        <path className="wh-spout" d="M232 40c-4-12-14-18-22-20M234 40c0-14 4-24 12-30M236 40c4-10 14-16 22-16" />
      </svg>
    </div>
  )
}
