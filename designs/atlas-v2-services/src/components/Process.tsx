'use client'

import { useEffect, useRef, useState } from 'react'
import { Boat } from './Drawings'

/* How a project goes: four ports. The boat moors at whichever step you're reading. */
export function Process({ steps }: { steps: { title: string; text: string }[] }) {
  const [at, setAt] = useState(0)
  const list = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const items = Array.from(list.current?.querySelectorAll<HTMLElement>('.port-card') || [])
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setAt(Number((en.target as HTMLElement).dataset.k))
      },
      { rootMargin: '-42% 0px -42% 0px' },
    )
    items.forEach((i) => io.observe(i))
    return () => io.disconnect()
  }, [steps.length])

  return (
    <section id="voyage" className="process" aria-labelledby="pr-h">
      <div className="wrap">
        <header className="rv">
          <p className="eyebrow">The voyage</p>
          <h2 id="pr-h" className="h-sec">How it goes.</h2>
          <p className="lead">Four ports between your idea and the live thing.</p>
        </header>
        <ol className="ports" ref={list}>
          {steps.map((s, k) => (
            <li
              key={s.title}
              data-k={k}
              className={`port-card rv${k < at ? ' done' : ''}${k === at ? ' now' : ''}`}
              style={{ ['--rv' as string]: k }}
              onMouseEnter={() => setAt(k)}
            >
              <span className="port-mark" aria-hidden="true">
                {k === at && <Boat size={36} className="rock port-boat" />}
                <span className="port-b" />
              </span>
              <span className="port-n mono-s">0{k + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="promise rv">
          <strong>You own everything.</strong> The code, the designs, the accounts and the domain.
        </p>
      </div>
    </section>
  )
}
