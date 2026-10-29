import { emblemData, pigmentFor, type IsleStatus } from '@/lib/atlas'

type Props = {
  id: string
  status: IsleStatus
  icon?: string | null
  pigment?: string | null
  size?: number
  className?: string
}

/* Contour-ring island emblem. Pure render, works in server and client components. */
export function Emblem({ id, status, icon, pigment, size = 56, className = '' }: Props) {
  const d = emblemData(id, status, icon)
  const fill = pigmentFor(id, pigment)
  return (
    <svg
      className={`emb e-${status} ${className}`}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ ['--pg' as string]: fill }}
    >
      {status === 'live' && (
        <>
          <path d={d.outer} className="wash" />
          <path d={d.mid} className="wash" opacity=".75" />
          <path d={d.outer} className="cl" />
          <path d={d.mid} className="cl" />
          <path d={d.inner} className="pl" />
        </>
      )}
      {status === 'building' && (
        <>
          <path d={d.outer} className="wash" opacity=".45" />
          <path d={d.outer} className="cl" />
          <path d={d.mid} className="cl dash" />
          <path d={d.inner} className="pl dash" />
        </>
      )}
      {status === 'idea' && (
        <>
          <path d={d.outer} className="cl dash" />
          <path d={d.inner} className="cl" opacity=".5" />
        </>
      )}
      {d.soundings.map((s, i) => (
        <path key={i} className="snd" d={s} />
      ))}
      <g className="ic" transform="translate(21 21) scale(.92)" dangerouslySetInnerHTML={{ __html: d.icon }} />
    </svg>
  )
}
