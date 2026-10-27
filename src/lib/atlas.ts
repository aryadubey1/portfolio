/* The atlas toolkit, ported from Code Atlas: seeded randomness so every island,
   emblem and blot is drawn from its own id and always comes out the same. */

export const hash = (s: string): number => {
  let h = 2166136261
  for (const ch of String(s)) {
    h ^= ch.codePointAt(0)!
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const rng = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export const r1 = (v: number) => Math.round(v * 10) / 10

type Pt = [number, number]

/* closed Catmull-Rom → cubic Bézier path */
export const smooth = (p: Pt[]): string => {
  const n = p.length
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n], e = p[(i + 2) % n]
    d += `C${r1(b[0] + (c[0] - a[0]) / 6)} ${r1(b[1] + (c[1] - a[1]) / 6)} ${r1(c[0] - (e[0] - b[0]) / 6)} ${r1(c[1] - (e[1] - b[1]) / 6)} ${r1(c[0])} ${r1(c[1])}`
  }
  return d + 'Z'
}

/* open Catmull-Rom through points (routes between islands) */
export const curve = (p: Pt[]): string => {
  if (p.length < 2) return ''
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)]
    d += `C${r1(b[0] + (c[0] - a[0]) / 6)} ${r1(b[1] + (c[1] - a[1]) / 6)} ${r1(c[0] - (e[0] - b[0]) / 6)} ${r1(c[1] - (e[1] - b[1]) / 6)} ${r1(c[0])} ${r1(c[1])}`
  }
  return d
}

type Shape = { k1: number; k2: number; p1: number; p2: number; a1: number; a2: number }

export const shapeOf = (R: () => number, amp: number): Shape => ({
  k1: 2 + Math.floor(R() * 3),
  k2: 4 + Math.floor(R() * 3),
  p1: R() * 6.283,
  p2: R() * 6.283,
  a1: amp * (0.7 + R() * 0.3),
  a2: amp * (0.3 + R() * 0.25),
})

export const ring = (cx: number, cy: number, r: number, sh: Shape, drift: number, n: number) => {
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2
    const rr = r * (1 + sh.a1 * Math.sin(sh.k1 * th + sh.p1 + drift) + sh.a2 * Math.sin(sh.k2 * th + sh.p2 - drift * 1.3))
    pts.push([cx + Math.cos(th) * rr, cy + Math.sin(th) * rr])
  }
  return smooth(pts)
}

export const blob = (cx: number, cy: number, r: number, seed: string, amp = 0.13) =>
  ring(cx, cy, r, shapeOf(rng(hash(seed)), amp), 0, 26)

/* ---------- pigments (tokens live in globals.css) ---------- */
export const PIGMENTS = ['coral', 'mint', 'honey', 'sage', 'peach', 'ice', 'teal', 'sky', 'pink', 'orchid', 'sand', 'lilac'] as const
export type Pigment = (typeof PIGMENTS)[number]

export const pigmentFor = (id: string, chosen?: string | null): string => {
  const k = chosen && (PIGMENTS as readonly string[]).includes(chosen) ? chosen : PIGMENTS[hash(id) % PIGMENTS.length]
  return `var(--pg-${k})`
}

/* ---------- island status ---------- */
export type IsleStatus = 'live' | 'building' | 'idea'

/* ---------- line-art pictograms (24px grid) ---------- */
export const ICON: Record<string, string> = {
  receipt: '<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3.3 19.5c.5-3.4 2.8-5.4 5.7-5.4s5.2 2 5.7 5.4"/><circle cx="16.8" cy="9.2" r="2.5"/><path d="M15.6 14.1c2.7-.2 4.7 1.5 5.2 4.6"/>',
  boxes: '<path d="M3.5 12h8v8.5h-8zM12.5 12h8v8.5h-8zM8 3.5h8V12H8z"/><path d="M7.5 12v2.5M16.5 12v2.5M12 3.5V6"/>',
  card: '<rect x="2.5" y="5.5" width="15" height="11" rx="2"/><path d="M2.5 9h15"/><circle class="f" cx="17.5" cy="15.5" r="4"/><path d="M17.5 13.8v3.4"/>',
  plug: '<path d="M9 3v4M15 3v4"/><path d="M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0z"/><path d="M12 16v2c0 1.7 1.3 3 3 3h4.5"/>',
  screen: '<rect x="3" y="8.5" width="18" height="10" rx="1.6"/><path d="M12 18.5V21M8.5 21h7M6.5 12h6M6.5 15h4"/><path d="M8 6c-.9-1 .9-1.7 0-2.8M12 6c-.9-1 .9-1.7 0-2.8M16 6c-.9-1 .9-1.7 0-2.8"/>',
  chart: '<path d="M3.5 20.5h17"/><path d="M6.5 20.5v-5M10.5 20.5v-8M14.5 20.5v-6M18.5 20.5V9"/><path d="M5 10.5l4.5-4 4 2.5 5.5-5"/>',
  sliders: '<path d="M5 3.5v17M12 3.5v17M19 3.5v17"/><circle class="f" cx="5" cy="14.5" r="2.3"/><circle class="f" cx="12" cy="8" r="2.3"/><circle class="f" cx="19" cy="16" r="2.3"/>',
  chat: '<path d="M4.2 5h15.6c.9 0 1.7.8 1.7 1.7v8.6c0 .9-.8 1.7-1.7 1.7H10.5L6 20.5V17H4.2c-.9 0-1.7-.8-1.7-1.7V6.7C2.5 5.8 3.3 5 4.2 5z"/><circle class="k" cx="8" cy="11" r="1.1"/><circle class="k" cx="12" cy="11" r="1.1"/><circle class="k" cx="16" cy="11" r="1.1"/>',
  key: '<circle cx="8" cy="12" r="4.6"/><circle cx="8" cy="12" r="1.4"/><path d="M12.6 12H21M18.2 12v3.4M21 12v2.4"/>',
  mail: '<rect x="3" y="6" width="18" height="12.5" rx="1.6"/><path d="M3.6 7l8.4 6.2L20.4 7"/>',
  book: '<path d="M4 5.5c2.7-1 5.3-1 8 .8 2.7-1.8 5.3-1.8 8-.8v13c-2.7-1-5.3-1-8 .8-2.7-1.8-5.3-1.8-8-.8z"/><path d="M12 6.3v13"/>',
  cart: '<path d="M3 4h2.5l2.2 10.5h10.6L20.5 7H6.3"/><circle cx="9" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/>',
  truck: '<path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3.5v3h-7"/><circle class="f" cx="7" cy="17.5" r="2"/><circle class="f" cx="17" cy="17.5" r="2"/>',
  flag: '<path d="M7 21V3.8M7 4.2h10l-2.6 3.6L17 11.4H7"/>',
  dumbbell: '<path d="M6.5 7.5v9M17.5 7.5v9M3.8 10v4M20.2 10v4M6.5 12h11"/>',
  lamp: '<path d="M8 3.5h8l3.2 7H4.8z"/><path d="M12 10.5V19M8 20.5h8"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M10.5 18.5h3"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.6 3.6 5.5 3.6 8.5s-1 5.9-3.6 8.5c-2.6-2.6-3.6-5.5-3.6-8.5s1-5.9 3.6-8.5z"/>',
  code: '<path d="M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.5 5l-3 14"/>',
  question: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.6"/><circle class="k" cx="12" cy="16.8" r="1"/>',
  layers: '<path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z"/><path d="M3.5 12l8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5"/>',
  bolt: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
  server: '<rect x="3.5" y="4" width="17" height="7" rx="1.6"/><rect x="3.5" y="13" width="17" height="7" rx="1.6"/><circle class="k" cx="7.5" cy="7.5" r="1"/><circle class="k" cx="7.5" cy="16.5" r="1"/><path d="M11 7.5h6M11 16.5h6"/>',
}
export const ICON_KEYS = Object.keys(ICON)

/* An island emblem: contour rings generated from the id, washed by status,
   with a pictogram on the summit. Returns plain data so React (server or client) can render it. */
export type EmblemData = {
  status: IsleStatus
  outer: string
  mid: string
  inner: string
  soundings: string[]
  icon: string
}

export function emblemData(id: string, status: IsleStatus, icon?: string | null): EmblemData {
  const R = rng(hash(id || '?'))
  const sh = shapeOf(R, 0.085)
  const outer = ring(32, 32, 27, sh, 0, 30)
  const mid = ring(32, 32, 22.5, sh, 0.5, 30)
  const inner = ring(32, 32, 18, sh, 1, 30)
  const soundings: string[] = []
  for (let k = 0; k < 3; k++) {
    const a = R() * 6.283, rr = 29.5 + R() * 1.5
    const x = 32 + Math.cos(a) * rr, y = 32 + Math.sin(a) * rr
    soundings.push(`M${r1(x - 1.6)} ${r1(y)}h3.2M${r1(x)} ${r1(y - 1.6)}v3.2`)
  }
  return { status, outer, mid, inner, soundings, icon: icon === 'none' ? '' : ICON[icon || ''] || ICON.flag }
}

/* Per-island layout jitter (floating cards at slightly different heights and angles). */
export function isleStyle(id: string, i: number) {
  const R = rng(hash(id + '~isle'))
  const rad = [0, 0, 0, 0].map(() => 18 + Math.round(R() * 14) + 'px').join(' ')
  return {
    '--i': i,
    '--dx': `${r1((R() - 0.5) * 20)}px`,
    '--dy': `${r1((R() - 0.5) * 30)}px`,
    '--rot': `${r1((R() - 0.5) * 2.4)}deg`,
    '--depth': `${r1(5 + R() * 10)}px`,
    '--bd': `${r1(6.5 + R() * 3.5)}s`,
    '--bdl': `${r1(-R() * 9)}s`,
    '--rad': rad,
  } as Record<string, string | number>
}

export const slugify = (s: string) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
