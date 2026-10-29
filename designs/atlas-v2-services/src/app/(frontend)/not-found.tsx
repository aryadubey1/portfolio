import Link from 'next/link'
import { Boat } from '@/components/Drawings'

export default function NotFound() {
  return (
    <section className="lost wrap">
      <Boat size={96} className="rock" />
      <p className="eyebrow">404 · here be dragons</p>
      <h1 className="h-sec">Off the map.</h1>
      <p className="lead">This bit of sea hasn’t been charted yet. Let’s get you back to dry land.</p>
      <div className="hero-cta">
        <Link href="/" className="btn">Back to the map</Link>
        <Link href="/#quote" className="btn btn-ghost">Chart something new</Link>
      </div>
    </section>
  )
}
