import type { MetadataRoute } from 'next'
import { getIslands } from '@/lib/data'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://aryadubey.tech'
  const islands = await getIslands()
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    ...islands.map((p) => ({ url: `${base}/work/${p.slug}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]
}
