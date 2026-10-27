import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Emblem } from '@/components/Emblem'
import { Boat, G, Glyph } from '@/components/Drawings'
import { getIsland, getIslands, isAfloat } from '@/lib/data'
import { isleStyle } from '@/lib/atlas'

export const revalidate = 300

type Args = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const all = await getIslands()
  return all.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const p = await getIsland(slug)
  if (!p) return { title: 'Off the map' }
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: `${p.title} · Arya Dubey`, description: p.summary, images: p.cover ? [{ url: p.cover }] : undefined },
  }
}

export default async function IslandPage({ params }: Args) {
  const { slug } = await params
  const p = await getIsland(slug)
  if (!p) notFound()
  const [all, afloat] = await Promise.all([getIslands(), isAfloat(p.liveUrl)])
  const k = all.findIndex((x) => x.slug === p.slug)
  const next = all.length > 1 ? all[(k + 1) % all.length] : null
  const log = [
    { n: '01', t: 'The problem', b: p.story.problem },
    { n: '02', t: 'What I built', b: p.story.approach },
    { n: '03', t: 'How it turned out', b: p.story.outcome },
  ].filter((s) => s.b)

  return (
    <article className="isl wrap">
      <Link href="/#map" className="back">
        <Glyph d={G.back} size={16} /> Back to the map
      </Link>

      <header className="isl-hero">
        <div className="isl-emb">
          <Emblem id={p.slug} status={p.status} icon={p.icon} pigment={p.pigment} size={132} />
        </div>
        <div>
          <p className="eyebrow">{[p.category, afloat ? 'live' : p.status === 'building' ? 'taking shape' : ''].filter(Boolean).join(' · ')}</p>
          <h1 className="isl-h">{p.title}</h1>
          {p.tagline && <p className="lead">{p.tagline}</p>}
          <div className="hero-cta">
            {p.liveUrl && (
              <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn">
                {afloat && <span className="dot live" aria-hidden="true" />} Visit the live site <Glyph d={G.out} size={18} />
              </a>
            )}
            <Link href="/#quote" className="btn btn-ghost">Build something like this</Link>
          </div>
        </div>
      </header>

      {p.cover && (
        <figure className="isl-cover sheet" style={isleStyle(p.slug, 0)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.cover} alt={`${p.title}, screenshot`} />
          <span className="tape t1" aria-hidden="true" />
          <span className="tape t2" aria-hidden="true" />
        </figure>
      )}

      <div className="isl-body">
        <section className="isl-log" aria-label="The story">
          <p className="about isl-sum">{p.summary}</p>
          {log.map((s) => (
            <div key={s.n} className="log-step rv">
              <span className="mono-s">{s.n}</span>
              <h2>{s.t}</h2>
              <p>{s.b}</p>
            </div>
          ))}
        </section>

        <aside className="isl-side">
          {p.highlights.length > 0 && (
            <div className="sheet isl-card rv">
              <p className="eyebrow">On this island</p>
              <ul className="ticks">
                {p.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {p.stack.length > 0 && (
            <div className="sheet isl-card rv">
              <p className="eyebrow">Tools picked for this one</p>
              <div className="mods">
                {p.stack.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <nav className="isl-next" aria-label="Keep sailing">
        {next && (
          <Link href={`/work/${next.slug}`} className="sheet next-isle">
            <span className="mono-s">next island</span>
            <span className="next-row">
              <Emblem id={next.slug} status={next.status} icon={next.icon} pigment={next.pigment} size={48} />
              <span className="nm">{next.title}</span>
              <Glyph d={G.arrow} size={20} />
            </span>
          </Link>
        )}
        <Link href="/#quote" className="sheet next-isle next-idea">
          <span className="mono-s">or chart a new one</span>
          <span className="next-row">
            <Boat size={44} className="rock" />
            <span className="nm">Get a quote</span>
            <Glyph d={G.arrow} size={20} />
          </span>
        </Link>
      </nav>
    </article>
  )
}
