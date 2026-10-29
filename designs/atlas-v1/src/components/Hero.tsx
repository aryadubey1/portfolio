import Link from 'next/link'
import { Compass, G, Glyph } from './Drawings'
import { Emblem } from './Emblem'

/* "*word*" in a line paints a brush stroke behind that word */
function Line({ text, start }: { text: string; start: number }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <span className="hl-line">
      {words.map((w, i) => {
        const sw = /^\*(.+)\*([.,!?]*)$/.exec(w)
        return (
          <span key={i}>
            <span className="w" style={{ ['--i' as string]: start + i }}>
              {sw ? (
                <>
                  <span className="swash">{sw[1]}</span>
                  {sw[2]}
                </>
              ) : (
                w
              )}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        )
      })}
    </span>
  )
}

type Props = {
  eyebrow: string
  lines: string[]
  intro: string
  stats: { islands: number; live: number; tools: number }
}

export function Hero({ eyebrow, lines, intro, stats }: Props) {
  let n = 0
  return (
    <section className="hero wrap" aria-labelledby="hero-h">
      <div className="hero-txt">
        <p className="eyebrow hero-eye">{eyebrow}</p>
        <h1 id="hero-h" className="hl">
          {lines.map((l, i) => {
            const el = <Line key={i} text={l} start={n} />
            n += l.split(/\s+/).length
            return el
          })}
        </h1>
        <p className="lead hero-lead">{intro}</p>
        <div className="hero-cta">
          <Link href="/#quote" className="btn">
            Get a quote <span className="arr"><Glyph d={G.arrow} size={18} /></span>
          </Link>
          <Link href="/#map" className="btn btn-ghost">Explore the map</Link>
        </div>
      </div>

      <aside className="cartouche" aria-label="The map at a glance" data-no-drop>
        <div className="c-top">
          <Compass id="needle" />
          <div>
            <p className="c-title">aryadubey.tech</p>
            <p className="c-sub">an atlas · charted by hand</p>
          </div>
        </div>
        <dl className="soundings">
          <div><dt>islands</dt><dd>{stats.islands}</dd></div>
          <div><dt>live now</dt><dd>{stats.live}</dd></div>
          <div><dt>tools used</dt><dd>{stats.tools}</dd></div>
          <div><dt>uncharted</dt><dd>∞</dd></div>
        </dl>
        <ul className="legend">
          <li><Emblem id="honey" status="live" size={22} pigment="honey" icon="none" /> Live: shipped and running</li>
          <li><Emblem id="honey" status="building" size={22} pigment="honey" icon="none" /> Taking shape</li>
          <li><Emblem id="honey" status="idea" size={22} icon="none" /> Uncharted: your idea</li>
        </ul>
      </aside>

      <a href="#map" className="scroll-cue" aria-label="Scroll to the map">
        <span className="mono-s">set sail</span>
        <span className="cue-line" aria-hidden="true" />
      </a>
    </section>
  )
}
