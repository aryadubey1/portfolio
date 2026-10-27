'use client'

import { useId, useState } from 'react'

/* Questions as small toggles, plus one switch to open them all. */
export function Faq({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]))
  const base = useId()
  const all = open.size === faqs.length

  const flip = (k: number) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(k)) n.delete(k)
      else n.add(k)
      return n
    })

  return (
    <section id="questions" className="faq" aria-labelledby="faq-h">
      <div className="wrap faq-in">
        <header className="faq-head rv">
          <p className="eyebrow">Questions</p>
          <h2 id="faq-h" className="h-sec">Ask away.</h2>
          <button
            type="button"
            role="switch"
            aria-checked={all}
            className="faq-all"
            onClick={() => setOpen(all ? new Set() : new Set(faqs.map((_, k) => k)))}
          >
            <span className="pref-track" aria-hidden="true"><span /></span>
            Open all
          </button>
        </header>
        <div className="faqs">
          {faqs.map((f, k) => {
            const on = open.has(k)
            return (
              <div key={k} className={`qa sheet rv${on ? ' on' : ''}`} style={{ ['--rv' as string]: k % 3 }}>
                <h3>
                  <button type="button" aria-expanded={on} aria-controls={`${base}-${k}`} onClick={() => flip(k)}>
                    <span>{f.question}</span>
                    <span className="pm" aria-hidden="true" />
                  </button>
                </h3>
                <div id={`${base}-${k}`} role="region" className="ans" aria-hidden={!on}>
                  <div>
                    <p>{f.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
          <p className="faq-more mono-s rv">
            Didn’t find yours? <a href="#quote">Ask it with your idea</a> and I’ll answer.
          </p>
        </div>
      </div>
    </section>
  )
}
