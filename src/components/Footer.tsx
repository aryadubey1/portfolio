import Link from 'next/link'
import { Boat } from './Drawings'

const SHA = process.env.NEXT_PUBLIC_GIT_SHA || 'dev'
const BUILT = process.env.NEXT_PUBLIC_BUILT_AT || ''

const fmt = (iso: string) => {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
}

export function Footer({ socials }: { socials: { label: string; url: string }[] }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-edge rv">
          <Boat size={56} className="rock" />
          <p className="foot-big">
            The map keeps <span className="swash">growing.</span>
          </p>
          <p className="foot-sub">Every island here started as somebody’s idea. Yours could be the next one.</p>
          <Link href="/#quote" className="btn">Get a quote</Link>
        </div>
        <div className="foot-row">
          <p className="foot-sig">Designed, built and shipped by Arya Dubey.</p>
          <ul className="foot-social">
            {socials.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <p className="foot-sys mono-s">
          <span className="dot live" aria-hidden="true" /> aryadubey.tech · running on my own ARM server · build{' '}
          <code>{SHA}</code>
          {BUILT && <> · shipped {fmt(BUILT)}</>} · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
