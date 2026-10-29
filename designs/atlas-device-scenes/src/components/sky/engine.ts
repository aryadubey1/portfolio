/* The sea engine: WebGL1, no dependencies, no React.
   Pools drift around home positions (Code Atlas layout), the pointer stirs them,
   clicks drop ink, scrolling sails you across the chart. */

import { DROPS, POOLS, STIRS, VERT, makeFrag } from './shader'

export type SkyHandle = { destroy(): void }

type RGB = [number, number, number]

const TOKENS = ['--paper', '--ink', '--accent', '--wash-1', '--wash-2', '--wash-3', '--wash-4', '--wash-5', '--wash-6', '--wash-7'] as const
const DAY_FALLBACK: RGB[] = ['#fbfaf7', '#15161d', '#2b36d9', '#f4a9bf', '#f8d77c', '#98c4f0', '#98d6bd', '#c5b6f0', '#f7baa0', '#a4dae6'].map(hexRGB)
const NO_DROP = 'a, button, input, textarea, select, label, summary, .sheet, .isle, [data-no-drop]'

/* home positions (viewport fractions) — the first seven are Code Atlas's */
const HOMES: [number, number][] = [[0.12, 0.18], [0.78, 0.12], [0.5, 0.52], [0.1, 0.78], [0.88, 0.66], [0.46, 0.94], [0.3, 0.34], [0.72, 0.86]]
const POOL_WASH = [0, 2, 1, 3, 4, 5, 6, 2]

function hexRGB(h: string): RGB {
  h = h.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const v = parseInt(h, 16)
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]
}

function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createSky(canvas: HTMLCanvasElement): SkyHandle {
  const root = document.documentElement
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)')
  const COARSE = window.matchMedia('(pointer: coarse)')

  /* ---------- colour tokens ---------- */
  const probe = document.createElement('canvas').getContext('2d')
  const parse = (str: string, fb: RGB): RGB => {
    str = str.trim()
    if (!str) return fb
    if (/^#[0-9a-f]{3,8}$/i.test(str)) return hexRGB(str.slice(0, 7))
    if (!probe) return fb
    probe.fillStyle = '#000'
    probe.fillStyle = str
    const v = String(probe.fillStyle)
    if (v.startsWith('#')) return hexRGB(v)
    const m = v.match(/[\d.]+/g)
    return m && m.length >= 3 ? [+m[0] / 255, +m[1] / 255, +m[2] / 255] : fb
  }
  const readTheme = () => {
    const cs = getComputedStyle(root)
    return {
      colors: TOKENS.map((t, i) => parse(cs.getPropertyValue(t), DAY_FALLBACK[i])),
      night: root.getAttribute('data-theme') === 'night' ? 1 : 0,
    }
  }
  let target = readTheme()
  let from = { colors: target.colors.map((c) => [...c] as RGB), night: target.night }
  let cur = { colors: target.colors.map((c) => [...c] as RGB), night: target.night }
  let fadeStart = -1
  const FADE = 0.6

  /* ---------- motion ---------- */
  const motionOff = () => root.getAttribute('data-motion') === 'off' || (RM.matches && root.getAttribute('data-motion') !== 'on')
  const small = () => COARSE.matches || window.innerWidth < 760

  /* ---------- pools ---------- */
  const R = mulberry(20261027)
  const pools = HOMES.map(([hx, hy], i) => ({
    hx: hx + (R() - 0.5) * 0.08,
    hy: hy + (R() - 0.5) * 0.08,
    r: 0.18 + R() * 0.12,
    ax: 0.07 + R() * 0.09,
    ay: 0.06 + R() * 0.08,
    wx: (0.03 + R() * 0.03) * (R() < 0.5 ? -1 : 1),
    wy: (0.025 + R() * 0.03) * (R() < 0.5 ? -1 : 1),
    ph: R() * 6.2,
    k: 2 + (i % 3),
    wash: POOL_WASH[i],
    ox: 0, oy: 0, vx: 0, vy: 0,
  }))

  /* ---------- brush + drops ---------- */
  const stirs = Array.from({ length: STIRS }, () => ({ x: 0, y: 0, vx: 0, vy: 0, t: -99, s: 0 }))
  let si = 0
  let lastP: { x: number; y: number; t: number } | null = null
  let pdx = 0, pdy = 0 // pointer travel since last frame (aspect units), for pushing pools
  let px = -9, py = -9
  const drops: { x: number; y: number; t: number; life: number; r0: number; r1: number; al: number; c: number }[] = []
  let nextDrop = 2.5

  /* ---------- size ---------- */
  let cssW = canvas.clientWidth || window.innerWidth
  let cssH = canvas.clientHeight || window.innerHeight
  let bufW = 1, bufH = 1, aspect = 1

  /* ---------- GL ---------- */
  let gl: WebGLRenderingContext | null = null
  let prog: WebGLProgram | null = null
  let buf: WebGLBuffer | null = null
  const U: Record<string, WebGLUniformLocation | null> = {}
  const poolArr = new Float32Array(POOLS * 4), poolC = new Float32Array(POOLS * 3)
  const stirArr = new Float32Array(STIRS * 4)
  const dropArr = new Float32Array(DROPS * 4), dropC = new Float32Array(DROPS * 3)

  function compile(type: number, src: string) {
    const s = gl!.createShader(type)!
    gl!.shaderSource(s, src)
    gl!.compileShader(s)
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS) && !gl!.isContextLost()) {
      console.warn('[sky] shader:', gl!.getShaderInfoLog(s))
      gl!.deleteShader(s)
      return null
    }
    return s
  }
  function link(contours: boolean) {
    const v = compile(gl!.VERTEX_SHADER, VERT), f = compile(gl!.FRAGMENT_SHADER, makeFrag(contours))
    if (!v || !f) return null
    const p = gl!.createProgram()!
    gl!.attachShader(p, v)
    gl!.attachShader(p, f)
    gl!.bindAttribLocation(p, 0, 'aPos')
    gl!.linkProgram(p)
    gl!.deleteShader(v)
    gl!.deleteShader(f)
    if (!gl!.getProgramParameter(p, gl!.LINK_STATUS)) {
      gl!.deleteProgram(p)
      return null
    }
    return p
  }
  function initGL(): boolean {
    const opts: WebGLContextAttributes = { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'low-power' }
    gl = (canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts)) as WebGLRenderingContext | null
    if (!gl) return false
    const deriv = !!gl.getExtension('OES_standard_derivatives')
    prog = link(deriv) || (deriv ? link(false) : null)
    if (!prog) return false
    gl.useProgram(prog)
    buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    for (const n of ['uRes', 'uAspect', 'uTime', 'uShift', 'uNight', 'uPaper', 'uInk', 'uAccent', 'uPool', 'uPoolC', 'uStir', 'uDrop', 'uDropC']) {
      U[n] = gl.getUniformLocation(prog, n) || gl.getUniformLocation(prog, n + '[0]')
    }
    sizeBuffer(true)
    return true
  }

  function sizeBuffer(force = false) {
    if (!gl) return
    const w = Math.max(1, cssW), h = Math.max(1, cssH)
    let scale = small() ? 0.4 : 0.5
    scale = Math.min(scale, Math.sqrt(420000 / (w * h)))
    const bw = Math.max(2, Math.round(w * scale)), bh = Math.max(2, Math.round(h * scale))
    // phones resize the viewport as the URL bar slides; only reallocate for real changes
    if (!force && bw === bufW && Math.abs(bh - bufH) < Math.max(24, bufH * 0.12)) return
    bufW = bw
    bufH = bh
    canvas.width = bw
    canvas.height = bh
    aspect = bw / bh
    gl.viewport(0, 0, bw, bh)
  }

  /* ---------- frame ---------- */
  let raf = 0, t0 = performance.now(), lastFrame = 0, T = 0, frameDt = 1 / 30, running = false, shown = false
  const STILL_T = 34

  function updateColors(now: number) {
    if (fadeStart < 0) return
    const k = Math.min(1, (now - fadeStart) / FADE), e = k * k * (3 - 2 * k)
    cur = {
      colors: target.colors.map((c, i) => c.map((v, j) => from.colors[i][j] + (v - from.colors[i][j]) * e) as RGB),
      night: from.night + (target.night - from.night) * e,
    }
    if (k >= 1) fadeStart = -1
  }

  function draw(T: number, nowS: number, still: boolean) {
    if (!gl || !prog || gl.isContextLost()) return
    const vh = Math.max(1, cssH)
    const scroll = window.scrollY || 0
    const sv = scroll / vh // viewport heights scrolled
    const Tp = T + sv * 12 // scrolling advances the drift
    // pool size: mostly the diagonal, pulled in on portrait screens so phones keep some bare paper
    const diag = 0.55 * Math.hypot(aspect, 1) + 0.45 * Math.min(aspect, 1)
    const bloom = still ? 1 : 1 - Math.pow(1 - Math.min(1, T / 2.6), 3)

    for (let i = 0; i < POOLS; i++) {
      const b = pools[i]
      let x = (b.hx + Math.sin(Tp * b.wx + b.ph) * b.ax) * aspect
      let y = b.hy + Math.cos(Tp * b.wy + b.ph * 1.7) * b.ay + Math.sin(sv * 0.9 + b.ph) * 0.05
      const r = b.r * diag * (0.8 + 0.2 * bloom)
      if (!still && (pdx || pdy)) {
        // pools under the brush drift after it (Code Atlas), a little calmer
        const d = Math.hypot(x + b.ox - px, y + b.oy - py)
        if (d < r) {
          const f = (1 - d / r) * 0.035
          b.vx += pdx * f
          b.vy += pdy * f
        }
      }
      if (!still) {
        // damping tuned per 30fps frame; scale by the real frame time
        const fs = Math.min(4, frameDt * 30)
        const dv = Math.pow(0.94, fs), dp = Math.pow(0.996, fs)
        b.vx *= dv; b.vy *= dv
        b.ox = (b.ox + b.vx * fs) * dp; b.oy = (b.oy + b.vy * fs) * dp
      }
      x += b.ox
      y += b.oy
      poolArr.set([x, y, r, b.k * 10 + b.ph], i * 4)
      poolC.set(cur.colors[3 + b.wash], i * 3)
    }
    pdx = pdy = 0

    for (let i = 0; i < STIRS; i++) {
      const s = stirs[i], age = nowS - s.t
      const w = still || age > 1.6 ? 0 : Math.exp(-age / 0.5) * s.s
      // each sample pulls at most 0.018 viewport heights; positions are viewport fractions, velocities aspect space
      let dx = s.vx * w * 0.02, dy = s.vy * w * 0.02
      const m = Math.hypot(dx, dy)
      if (m > 0.018) { dx *= 0.018 / m; dy *= 0.018 / m }
      stirArr.set([s.x * aspect, s.y, dx, dy], i * 4)
    }

    for (let i = drops.length - 1; i >= 0; i--) if (T - drops[i].t >= drops[i].life) drops.splice(i, 1)
    for (let i = 0; i < DROPS; i++) {
      const d = drops[i]
      if (!d || still) {
        dropArr.set([0, 0, 0, 0], i * 4)
        continue
      }
      const a = (T - d.t) / d.life, k = 1 - Math.pow(1 - a, 3)
      dropArr.set([d.x * aspect, d.y, (d.r0 + d.r1 * k) / vh, d.al * (1 - a)], i * 4)
      dropC.set(d.c < 0 ? cur.colors[2] : cur.colors[3 + d.c], i * 3)
    }

    gl.uniform2f(U.uRes, bufW, bufH)
    gl.uniform1f(U.uAspect, aspect)
    gl.uniform1f(U.uTime, T)
    gl.uniform1f(U.uShift, (scroll * 0.08) / vh)
    gl.uniform1f(U.uNight, cur.night)
    gl.uniform3fv(U.uPaper, cur.colors[0])
    gl.uniform3fv(U.uInk, cur.colors[1])
    gl.uniform3fv(U.uAccent, cur.colors[2])
    gl.uniform4fv(U.uPool, poolArr)
    gl.uniform3fv(U.uPoolC, poolC)
    gl.uniform4fv(U.uStir, stirArr)
    gl.uniform4fv(U.uDrop, dropArr)
    gl.uniform3fv(U.uDropC, dropC)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    if (!shown) {
      shown = true
      canvas.style.opacity = '1'
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    const minGap = small() ? 32 : 15
    if (lastFrame && now - lastFrame < minGap) return
    frameDt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 1 / 30
    lastFrame = now
    T = (now - t0) / 1000
    updateColors(now / 1000)
    if (T > nextDrop) {
      addDrop(cssW * (0.15 + R() * 0.7), cssH * (0.12 + R() * 0.7), R() < 0.35)
      nextDrop = T + 10 + R() * 6
    }
    draw(T, now / 1000, false)
  }

  function start() {
    if (running || !gl || motionOff() || document.hidden) return
    running = true
    lastFrame = 0
    raf = requestAnimationFrame(frame)
  }
  function stop() {
    running = false
    cancelAnimationFrame(raf)
    raf = 0
  }
  function still() {
    fadeStart = -1
    cur = { colors: target.colors.map((c) => [...c] as RGB), night: target.night }
    draw(STILL_T, performance.now() / 1000, true)
  }
  function sync() {
    if (motionOff()) {
      stop()
      still()
    } else start()
  }

  /* ---------- input ---------- */
  function addStir(cx: number, cy: number, strength: number) {
    const now = performance.now() / 1000
    const x = cx / Math.max(1, cssW), y = cy / Math.max(1, cssH)
    if (lastP && now - lastP.t < 0.25) {
      const dt = Math.max(0.008, now - lastP.t)
      // velocity in aspect space (viewport heights) per second, clamped so a flick doesn't tear the paper
      let vx = ((x - lastP.x) * aspect) / dt, vy = (y - lastP.y) / dt
      const m = Math.hypot(vx, vy)
      if (m > 2.5) { vx *= 2.5 / m; vy *= 2.5 / m }
      if (now - lastP.t > 0.014) {
        const s = stirs[si]
        s.x = x; s.y = y; s.vx = vx; s.vy = vy; s.t = now; s.s = strength
        si = (si + 1) % STIRS
      }
      pdx += (x - lastP.x) * aspect
      pdy += y - lastP.y
    }
    px = x * aspect
    py = y
    lastP = { x, y, t: now }
  }
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
    if (running) addStir(e.clientX, e.clientY, 1)
  }
  const onTouch = (e: TouchEvent) => {
    const t = e.touches[0]
    if (t && running) addStir(t.clientX, t.clientY, 0.6)
  }
  const onTouchEnd = () => { lastP = null }

  function addDrop(cx: number, cy: number, accent?: boolean) {
    if (!running) return
    drops.push({
      x: cx / Math.max(1, cssW), y: cy / Math.max(1, cssH), t: T,
      life: 5 + R() * 2, r0: 10, r1: 130 + R() * 120, al: accent ? 0.3 : 0.5,
      c: accent ? -1 : Math.floor(R() * 7),
    })
    if (drops.length > DROPS) drops.shift()
  }
  const onClick = (e: MouseEvent) => {
    const el = e.target as Element | null
    if (el && el.closest && el.closest(NO_DROP)) return
    if (window.getSelection && String(window.getSelection() || '').length) return
    addDrop(e.clientX, e.clientY, R() < 0.35)
  }
  const onSkyDrop = (e: Event) => {
    const d = (e as CustomEvent<{ x: number; y: number; accent?: boolean }>).detail
    if (d && Number.isFinite(d.x) && Number.isFinite(d.y)) addDrop(d.x, d.y, d.accent)
  }

  /* ---------- environment ---------- */
  const ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver((ents) => {
        const r = ents[0].contentRect
        cssW = r.width || window.innerWidth
        cssH = r.height || window.innerHeight
        sizeBuffer()
        if (!running) still()
      })
    : null
  const onResize = () => {
    cssW = canvas.clientWidth || window.innerWidth
    cssH = canvas.clientHeight || window.innerHeight
    sizeBuffer()
    if (!running) still()
  }
  const mo = new MutationObserver(() => {
    const next = readTheme()
    const changed = next.night !== target.night || next.colors.some((c, i) => c.some((v, j) => Math.abs(v - target.colors[i][j]) > 0.002))
    if (changed) {
      from = { colors: cur.colors.map((c) => [...c] as RGB), night: cur.night }
      target = next
      fadeStart = performance.now() / 1000
    }
    sync()
  })
  const onVis = () => (document.hidden ? stop() : sync())
  let stillQueued = false
  const onScrollStill = () => {
    if (running || !shown || stillQueued) return
    stillQueued = true
    requestAnimationFrame(() => { stillQueued = false; if (!running) still() })
  }
  const onLost = (e: Event) => { e.preventDefault(); stop() }
  const onRestored = () => { if (initGL()) sync() }

  /* ---------- boot ---------- */
  canvas.style.opacity = '0'
  canvas.style.transition = 'opacity 1.2s cubic-bezier(.2,.8,.2,1)'
  if (!initGL()) return { destroy() {} }

  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('touchmove', onTouch, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('scroll', onScrollStill, { passive: true })
  document.addEventListener('click', onClick)
  window.addEventListener('sky:drop', onSkyDrop)
  document.addEventListener('visibilitychange', onVis)
  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)
  if (ro) ro.observe(canvas)
  else window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onResize)
  // only theme/motion attributes: pointer effects write CSS vars to <html> style on every move
  mo.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-motion'] })
  RM.addEventListener?.('change', sync)

  sync()
  if (running) addDrop(cssW * 0.3, cssH * 0.26, true)

  return {
    destroy() {
      stop()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('scroll', onScrollStill)
      document.removeEventListener('click', onClick)
      window.removeEventListener('sky:drop', onSkyDrop)
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      ro?.disconnect()
      mo.disconnect()
      RM.removeEventListener?.('change', sync)
      // free GPU objects but keep the context alive: React StrictMode remounts on the same canvas,
      // and a canvas hands back its (lost) context forever once loseContext() has been called
      if (gl && !gl.isContextLost()) {
        if (buf) gl.deleteBuffer(buf)
        if (prog) gl.deleteProgram(prog)
      }
      gl = null
    },
  }
}
