'use client'

import { useEffect, useRef } from 'react'
import { createSky } from './sky/engine'

/* The living watercolour sea. Mounted once in the layout, fixed behind everything.
   If WebGL is unavailable the canvas stays empty and the CSS gradient on .sky shows through.
   Fire `window.dispatchEvent(new CustomEvent('sky:drop', { detail: { x, y, accent } }))` to drop ink. */
export function Sky() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const sky = createSky(canvas)
    return () => sky.destroy()
  }, [])

  return (
    <div className="sky" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  )
}
