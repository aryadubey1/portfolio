'use client'

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Emblem } from '@/components/Emblem'
import { ICON, hash, pigmentFor, type IsleStatus } from '@/lib/atlas'
import { submitQuote } from '@/app/(frontend)/actions'
import type { QuoteState } from '@/app/(frontend)/actions'
import s from './Quote.module.css'

type Make = { label: string; icon?: string | null }
type Contact = { email?: string | null; whatsapp?: string | null; bookingUrl?: string | null }
type Props = { makes: Make[]; contact: Contact }

const SOMETHING_NEW: Make = { label: 'Something new', icon: 'spark' }
const STAGES = ['Just an idea', 'I have sketches or designs', 'Something exists, it needs work']
const TIMINGS = ["Whenever it's right", 'In the next few weeks', 'As soon as possible']
const PORTS = ['Making', 'Stage', 'When', 'Details']
const STEPS = [
  { h: 'What are we making?', hint: 'Pick as many as you like.' },
  { h: "Where's it at?", hint: 'Any starting point works.' },
  { h: 'When would you like it?', hint: "There's no wrong answer." },
  { h: 'Tell me about it', hint: 'A few lines is plenty. Give it a name and watch your island take shape.' },
]
const STATUS_LABEL: Record<IsleStatus, string> = { idea: 'Uncharted', building: 'Taking shape', live: 'Charted ✓' }

export function Quote({ makes, contact }: Props) {
  // bumping the key remounts the flow, which also resets the server action state
  const [round, setRound] = useState(0)
  return (
    <section id="quote" aria-labelledby="quote-h" className={s.section}>
      <div className="wrap">
        <header className={s.head}>
          <p className="eyebrow">Uncharted waters</p>
          <h2 id="quote-h" className="h-sec">
            Chart your <span className="swash">idea</span>.
          </h2>
          <p className="lead">
            Big, small or still a little fuzzy, tell me what you have in mind. I&apos;ll come back with questions, a
            plan and a quote.
          </p>
        </header>
        <QuoteFlow key={round} makes={makes} onReset={() => setRound((r) => r + 1)} />
        <Reach contact={contact} />
      </div>
    </section>
  )
}

/* follows the site's motion toggle as well as the OS setting */
function useReduce() {
  const os = useReducedMotion()
  const [attr, setAttr] = useState<string | undefined>(undefined)
  useEffect(() => {
    const el = document.documentElement
    const read = () => setAttr(el.dataset.motion)
    read()
    const mo = new MutationObserver(read)
    mo.observe(el, { attributes: true, attributeFilter: ['data-motion'] })
    return () => mo.disconnect()
  }, [])
  return attr === 'off' || (!!os && attr !== 'on')
}

function QuoteFlow({ makes, onReset }: { makes: Make[]; onReset: () => void }) {
  const options = useMemo(() => {
    const seen = new Set<string>()
    const list: Make[] = []
    for (const m of [...makes, SOMETHING_NEW]) {
      const k = m.label.trim().toLowerCase()
      if (!k || seen.has(k)) continue
      seen.add(k)
      list.push(m)
    }
    return list
  }, [makes])

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [making, setMaking] = useState<string[]>([])
  const [stage, setStage] = useState('')
  const [timing, setTiming] = useState('')
  const [islandName, setIslandName] = useState('')
  const [idea, setIdea] = useState('')
  const [name, setName] = useState('')
  const [reach, setReach] = useState('')
  const [state, formAction, pending] = useActionState<QuoteState, FormData>(submitQuote, null)
  const done = state?.ok === true
  const error = state && !state.ok ? state.error : ''

  const reduce = useReduce()
  const previewRef = useRef<HTMLDivElement>(null)
  const moved = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  // move focus to the new step's heading, but only after the visitor navigated (never on first load)
  const focusHeading = useCallback((el: HTMLHeadingElement | null) => {
    if (el && moved.current) {
      moved.current = false
      el.focus({ preventScroll: true })
    }
  }, [])

  const go = (to: number) => {
    moved.current = true
    setDir(to > step ? 1 : -1)
    setStep(to)
  }
  const pickOne = (setter: (v: string) => void, current: string, v: string) => {
    setter(v)
    // single-choice steps sail on by themselves after a beat
    if (v !== current && step < 3) {
      if (timer.current) clearTimeout(timer.current)
      const from = step
      timer.current = setTimeout(() => {
        moved.current = true
        setDir(1)
        setStep((cur) => (cur === from ? from + 1 : cur))
      }, 320)
    }
  }
  const toggle = (label: string) =>
    setMaking((m) => (m.includes(label) ? m.filter((x) => x !== label) : [...m, label]))

  // when the idea is charted, drop a splash of ink on the sea right where the island sits
  useEffect(() => {
    if (!done) return
    const el = previewRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    window.dispatchEvent(
      new CustomEvent('sky:drop', { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, accent: true } }),
    )
  }, [done])

  const answered = [making.length > 0, !!stage, !!timing, true][step]
  const status: IsleStatus = done ? 'live' : timing ? 'building' : 'idea'
  const seedId = islandName.trim() || 'your-idea'
  const first = options.find((o) => o.label === making[0])
  const icon = first?.icon && ICON[first.icon] ? first.icon : 'question'
  const h = hash(seedId)
  const chartNo = 1000 + (h % 9000)
  const tilt = ((h % 21) - 10) * 0.6
  const picks = [...making, stage, timing].filter(Boolean)
  const excerpt = idea.trim().length > 150 ? idea.trim().slice(0, 150) + '…' : idea.trim()

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 28 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -28 }),
  }
  const transition = { duration: reduce ? 0 : 0.34, ease: [0.2, 0.8, 0.2, 1] as const }

  return (
    <div className={s.grid}>
      {/* ---------- the island forming as they answer ---------- */}
      <div className={s.previewCol}>
        <div className={s.isle} ref={previewRef} aria-hidden="true">
          <span className={s.shadow} />
          <div className={s.float}>
            <div className={`sheet ${s.card}`} style={{ ['--pg' as string]: pigmentFor(seedId) }}>
              {done && (
                <span className={s.stamp}>
                  <span>Charted</span>
                </span>
              )}
              <div className={s.top}>
                <span className={s.embWrap} style={{ transform: `rotate(${tilt}deg)` }}>
                  <Emblem id={seedId} status={status} icon={icon} size={68} />
                </span>
                <span className={s.id}>
                  <span className={s.name}>{islandName.trim() || 'Your idea'}</span>
                  <span className={`pill p-${status}`}>{STATUS_LABEL[status]}</span>
                </span>
              </div>
              {picks.length > 0 && (
                <div className={s.picks}>
                  {picks.map((p) => (
                    <span key={p} className="chip">
                      {p}
                    </span>
                  ))}
                </div>
              )}
              <p className={s.excerpt}>{excerpt || 'Your words will appear here as you write.'}</p>
              <p className={s.caption}>
                chart no. {chartNo} · {done ? 'charted' : status === 'building' ? 'taking shape' : 'uncharted'}
              </p>
            </div>
          </div>
        </div>
        <p className={s.previewNote}>A new island forms as you answer.</p>
      </div>

      {/* ---------- the questions ---------- */}
      <div className={`sheet ${s.flow}`}>
        <Voyage step={step} done={done} reduce={reduce} />
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          {done ? (
            <motion.div
              key="done"
              className={s.thanks}
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              transition={transition}
              role="status"
            >
              <h3 className={s.stepH} tabIndex={-1} ref={focusHeading}>
                Charted.
              </h3>
              <p className={s.thanksText}>
                Got it. I&apos;ll read it properly and come back to you with questions and a quote.
              </p>
              <button type="button" className="btn btn-ghost" onClick={onReset}>
                Chart another idea
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              action={formAction}
              onSubmit={() => { moved.current = true }}
              className={s.form}
              initial={false}
              exit={{ opacity: 0 }}
              transition={transition}
            >
              <input type="hidden" name="making" value={making.join(', ')} />
              <input type="hidden" name="stage" value={stage} />
              <input type="hidden" name="timing" value={timing} />
              <div className={s.hp} aria-hidden="true">
                <label htmlFor="q-website">Leave this empty</label>
                <input id="q-website" type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>

              <AnimatePresence mode="wait" initial={false} custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                >
                  <h3 id={`q-step-${step}`} className={s.stepH} tabIndex={-1} ref={focusHeading}>
                    {STEPS[step].h}
                  </h3>
                  <p className={s.hint}>{STEPS[step].hint}</p>

                  {step === 0 && (
                    <div className={s.opts} role="group" aria-labelledby="q-step-0">
                      {options.map((o) => {
                        const on = making.includes(o.label)
                        return (
                          <button key={o.label} type="button" className={s.opt} aria-pressed={on} onClick={() => toggle(o.label)}>
                            <svg className={s.ico} viewBox="0 0 24 24" aria-hidden="true">
                              <g dangerouslySetInnerHTML={{ __html: ICON[o.icon || ''] || ICON.flag }} />
                            </svg>
                            {o.label}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {step === 1 && (
                    <div className={s.opts} role="group" aria-labelledby="q-step-1">
                      {STAGES.map((v) => (
                        <button key={v} type="button" className={s.opt} aria-pressed={stage === v} onClick={() => pickOne(setStage, stage, v)}>
                          {v}
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 2 && (
                    <div className={s.opts} role="group" aria-labelledby="q-step-2">
                      {TIMINGS.map((v) => (
                        <button key={v} type="button" className={s.opt} aria-pressed={timing === v} onClick={() => pickOne(setTiming, timing, v)}>
                          {v}
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 3 && (
                    <div className={s.fields}>
                      <div className={`${s.field} ${s.full}`}>
                        <label htmlFor="q-island">
                          Working name <span className={s.opt2}>optional</span>
                        </label>
                        <input
                          id="q-island"
                          className={s.input}
                          name="islandName"
                          value={islandName}
                          onChange={(e) => setIslandName(e.target.value)}
                          placeholder="Give it a working name"
                          maxLength={120}
                          autoComplete="off"
                        />
                      </div>
                      <div className={`${s.field} ${s.full}`}>
                        <label htmlFor="q-idea">Your words</label>
                        <textarea
                          id="q-idea"
                          className={`${s.input} ${s.area}`}
                          name="idea"
                          value={idea}
                          onChange={(e) => setIdea(e.target.value)}
                          placeholder="What should it do, who is it for, what's the itch?"
                          required
                          minLength={10}
                          maxLength={4000}
                          rows={4}
                        />
                      </div>
                      <div className={s.field}>
                        <label htmlFor="q-name">Your name</label>
                        <input
                          id="q-name"
                          className={s.input}
                          name="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          maxLength={120}
                          autoComplete="name"
                        />
                      </div>
                      <div className={s.field}>
                        <label htmlFor="q-contact">How do I reach you?</label>
                        <input
                          id="q-contact"
                          className={s.input}
                          name="contact"
                          value={reach}
                          onChange={(e) => setReach(e.target.value)}
                          placeholder="Email or phone"
                          required
                          maxLength={160}
                          autoComplete="email"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <p className={s.status} aria-live="polite">
                {error}
              </p>

              <div className={s.nav}>
                {step > 0 && (
                  <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)} disabled={pending}>
                    <span aria-hidden="true">←</span> Back
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" className={`btn ${s.next}`} onClick={() => go(step + 1)} disabled={!answered}>
                    Next <span className="arr" aria-hidden="true">→</span>
                  </button>
                ) : (
                  <button type="submit" className={`btn ${s.next}`} disabled={pending}>
                    {pending ? 'Charting…' : 'Get a quote'} <span className="arr" aria-hidden="true">→</span>
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Voyage({ step, done, reduce }: { step: number; done: boolean; reduce: boolean }) {
  return (
    <ol className={s.voyage} aria-label={done ? 'All steps done' : `Step ${step + 1} of ${PORTS.length}`}>
      {PORTS.map((p, i) => {
        const st = done || i < step ? 'done' : i === step ? 'now' : ''
        return (
          <li
            key={p}
            className={`${s.port} ${st === 'done' ? s.portDone : ''} ${st === 'now' ? s.portNow : ''}`}
            aria-current={st === 'now' ? 'step' : undefined}
          >
            {(st === 'now' || (done && i === PORTS.length - 1)) && (
              <motion.span layoutId="quote-boat" className={s.boatWrap} transition={{ duration: reduce ? 0 : 0.6, ease: [0.3, 1.3, 0.5, 1] }}>
                <svg className="boat rock" viewBox="0 0 40 28" aria-hidden="true">
                  <path className="wv" d="M2 26.5c3 0 3-1.6 6-1.6s3 1.6 6 1.6 3-1.6 6-1.6 3 1.6 6 1.6 3-1.6 6-1.6 3 1.6 6 1.6" />
                  <path className="sail" d="M20 1.5L28.5 16h-17z" />
                  <path className="hull" d="M3 16h34l-6.5 8.5h-21z" />
                  <path className="fold" d="M20 1.5V16M11.5 16L20 24.5 28.5 16" />
                </svg>
              </motion.span>
            )}
            <span className={s.b}>
              {st === 'done' && (
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2.4 6.3l2.4 2.4 4.8-5.2" />
                </svg>
              )}
            </span>
            <span className={s.pl}>
              {p}
              <span className="sr">{st === 'done' ? ' (done)' : st === 'now' ? ' (current)' : ''}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Reach({ contact }: { contact: Contact }) {
  const email = contact.email?.trim()
  const digits = (contact.whatsapp || '').replace(/\D/g, '')
  const booking = contact.bookingUrl?.trim()
  const links: React.ReactNode[] = []
  if (email) links.push(<a key="e" className={s.reachLink} href={`mailto:${email}`}>{email}</a>)
  if (digits.length >= 7)
    links.push(
      <a key="w" className={s.reachLink} href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>,
    )
  if (booking && /^https?:\/\//i.test(booking))
    links.push(
      <a key="b" className={s.reachLink} href={booking} target="_blank" rel="noopener noreferrer">
        Book a call
      </a>,
    )
  if (!links.length) return null
  return (
    <div className={s.reach}>
      <span className={s.reachLabel}>Or reach me directly</span>
      {links}
    </div>
  )
}
