import { ICON } from '@/lib/atlas'

/* "What I make" — two currents of buoys drifting in opposite directions. */
function Buoy({ label, icon }: { label: string; icon?: string | null }) {
  return (
    <li className="buoy">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <g className="bi" dangerouslySetInnerHTML={{ __html: ICON[icon || ''] || ICON.flag }} />
      </svg>
      {label}
    </li>
  )
}

export function Currents({ makes }: { makes: { label: string; icon?: string | null }[] }) {
  const half = Math.ceil(makes.length / 2)
  const rows = [makes.slice(0, half), makes.slice(half)]
  return (
    <section id="currents" className="currents" aria-labelledby="cur-h">
      <div className="wrap cur-head rv">
        <p className="eyebrow">Services</p>
        <h2 id="cur-h" className="h-sec">Whatever the idea needs.</h2>
        <p className="lead">Pick one or combine a few. If it runs on a screen, it can be built.</p>
      </div>
      <ul className="sr">
        {makes.map((m) => (
          <li key={m.label}>{m.label}</li>
        ))}
        <li>and whatever comes next</li>
      </ul>
      {rows.map((row, r) => (
        <div key={r} className={`current c${r}`} aria-hidden="true">
          <div className="current-track">
            {[0, 1].map((dup) => (
              <ul key={dup} className="current-set">
                {row.map((m) => (
                  <Buoy key={m.label} label={m.label} icon={m.icon} />
                ))}
                <li className="buoy buoy-open">and whatever comes next →</li>
              </ul>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
