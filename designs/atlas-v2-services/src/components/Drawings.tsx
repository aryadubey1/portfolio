import { r1 } from '@/lib/atlas'

/* Hand-drawn bits shared across the site (from Code Atlas). */

export function Boat({ className = '', size = 38 }: { className?: string; size?: number }) {
  return (
    <svg className={`boat ${className}`} viewBox="0 0 40 28" width={size} height={(size * 28) / 40} aria-hidden="true">
      <path className="wv" d="M2 26.5c3 0 3-1.6 6-1.6s3 1.6 6 1.6 3-1.6 6-1.6 3 1.6 6 1.6 3-1.6 6-1.6 3 1.6 6 1.6" />
      <path className="sail" d="M20 1.5L28.5 16h-17z" />
      <path className="hull" d="M3 16h34l-6.5 8.5h-21z" />
      <path className="fold" d="M20 1.5V16M11.5 16L20 24.5 28.5 16" />
    </svg>
  )
}

const ticks = (() => {
  const out: [number, number, number, number][] = []
  for (let a = 0; a < 360; a += 15) {
    const ri = a % 90 === 0 ? 37 : a % 45 === 0 ? 40 : 42.5, rad = (a * Math.PI) / 180
    out.push([r1(Math.sin(rad) * ri), r1(-Math.cos(rad) * ri), r1(Math.sin(rad) * 45.5), r1(-Math.cos(rad) * 45.5)])
  }
  return out
})()

export function Compass({ size = 74, className = '', id }: { size?: number; className?: string; id?: string }) {
  return (
    <svg className={`compass ${className}`} viewBox="-50 -50 100 100" width={size} height={size} aria-hidden="true">
      <circle r="47" className="cp-o" />
      <circle r="32" className="cp-i" />
      <g className="cp-t">
        {ticks.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      <text className="cp-l" y="-23" textAnchor="middle">N</text>
      <text className="cp-l" x="25" y="3" textAnchor="middle">E</text>
      <text className="cp-l" y="29" textAnchor="middle">S</text>
      <text className="cp-l" x="-25" y="3" textAnchor="middle">W</text>
      <g className="needle" id={id}>
        <g className="swing">
          <path d="M0-31L5.5 0H-5.5Z" className="nd-n" />
          <path d="M0 31L5.5 0H-5.5Z" className="nd-s" />
          <circle r="3.2" className="nd-c" />
        </g>
      </g>
    </svg>
  )
}

/* tiny line icons for the chrome (24px grid, stroke) */
export function Glyph({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g dangerouslySetInnerHTML={{ __html: d }} />
    </svg>
  )
}

export const G = {
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
  moon: '<path d="M20 14.6A8.2 8.2 0 1 1 9.4 4a6.6 6.6 0 0 0 10.6 10.6z"/>',
  waves: '<path d="M2.5 9c2.4 0 2.4-2 4.75-2S9.6 9 12 9s2.4-2 4.75-2S19.1 9 21.5 9M2.5 15c2.4 0 2.4-2 4.75-2S9.6 15 12 15s2.4-2 4.75-2 2.35 2 4.75 2"/>',
  still: '<path d="M2.5 9h19M2.5 15h19"/>',
  arrow: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
  out: '<path d="M8 16L16.5 7.5M9.5 7.5h7v7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M19.5 12h-15M10.5 6l-6 6 6 6"/>',
}
