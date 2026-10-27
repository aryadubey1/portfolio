'use client'

import { useEffect, useState } from 'react'
import { G, Glyph } from './Drawings'

/* Runs before paint (inlined in <head>) so the right sea shows with no flash. */
export const PREFS_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!window.__atlasReady)d.classList.add('no-reveal')},4000);try{var t=localStorage.getItem('atlas:theme');if(t!=='day'&&t!=='night')t=matchMedia('(prefers-color-scheme: dark)').matches?'night':'day';d.dataset.theme=t;var m=localStorage.getItem('atlas:motion');if(m==='on'||m==='off')d.dataset.motion=m}catch(e){d.dataset.theme='day'}})()`

type Theme = 'day' | 'night'

const motionIsOn = () => {
  const m = document.documentElement.dataset.motion
  if (m === 'on') return true
  if (m === 'off') return false
  return !matchMedia('(prefers-reduced-motion: reduce)').matches
}

const save = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* private mode */
  }
}

/* Two small switches: the night sea and motion. Every instance stays in sync. */
export function Prefs({ labelled = false }: { labelled?: boolean }) {
  const [theme, setTheme] = useState<Theme>('day')
  const [motion, setMotion] = useState(true)

  useEffect(() => {
    const sync = () => {
      setTheme(document.documentElement.dataset.theme === 'night' ? 'night' : 'day')
      setMotion(motionIsOn())
    }
    sync()
    window.addEventListener('atlas:prefs', sync)
    return () => window.removeEventListener('atlas:prefs', sync)
  }, [])

  const flipTheme = () => {
    const next: Theme = theme === 'night' ? 'day' : 'night'
    document.documentElement.dataset.theme = next
    save('atlas:theme', next)
    window.dispatchEvent(new Event('atlas:prefs'))
  }
  const flipMotion = () => {
    const next = motion ? 'off' : 'on'
    document.documentElement.dataset.motion = next
    save('atlas:motion', next)
    window.dispatchEvent(new Event('atlas:prefs'))
  }

  return (
    <div className={`prefs${labelled ? ' labelled' : ''}`}>
      <button type="button" role="switch" aria-checked={theme === 'night'} onClick={flipTheme} className="pref" title="Night sea">
        <span className="pref-ic">
          <Glyph d={theme === 'night' ? G.moon : G.sun} size={18} />
        </span>
        <span className={labelled ? 'pref-l' : 'sr'}>Night sea</span>
        {labelled && <span className="pref-track" aria-hidden="true"><span /></span>}
      </button>
      <button type="button" role="switch" aria-checked={motion} onClick={flipMotion} className="pref" title="Motion">
        <span className="pref-ic">
          <Glyph d={motion ? G.waves : G.still} size={18} />
        </span>
        <span className={labelled ? 'pref-l' : 'sr'}>Motion</span>
        {labelled && <span className="pref-track" aria-hidden="true"><span /></span>}
      </button>
    </div>
  )
}
