import { Hero } from '@/components/Hero'
import { Voyage } from '@/components/Voyage'
import { Currents } from '@/components/Currents'
import { Process } from '@/components/Process'
import { Faq } from '@/components/Faq'
import { Quote } from '@/components/Quote'
import { getFaqs, getIslands, getSite, isAfloat } from '@/lib/data'

export const revalidate = 300

export default async function Home() {
  const [site, islands, faqs] = await Promise.all([getSite(), getIslands(), getFaqs()])
  const featured = islands.filter((i) => i.featured)
  const afloat = await Promise.all(featured.map((i) => isAfloat(i.liveUrl)))
  const isles = featured.map((p, k) => ({ ...p, afloat: afloat[k] }))
  const tools = new Set(featured.flatMap((p) => p.stack.map((s) => s.toLowerCase())))

  return (
    <>
      <Hero
        eyebrow={site.heroEyebrow}
        lines={site.heroLines}
        intro={site.heroIntro}
        stats={{ islands: featured.length, live: afloat.filter(Boolean).length, tools: tools.size }}
      />
      <Voyage islands={isles} />
      <Currents makes={site.makes} />
      <Process steps={site.process} />
      <Faq faqs={faqs} />
      <Quote makes={site.makes} contact={{ email: site.email, whatsapp: site.whatsapp, bookingUrl: site.bookingUrl }} />
    </>
  )
}
