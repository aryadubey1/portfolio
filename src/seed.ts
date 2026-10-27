/* First-deploy seed. Safe to run on every deploy: it only fills what is empty.
   Run with: npm run seed */
import { getPayload } from 'payload'
import config from './payload.config'
import { FAQ_DEFAULTS, PROJECT_SEED, SITE_DEFAULTS } from './lib/content'
import type { Project, Site } from './payload-types'

type MakeIcon = NonNullable<Site['makes']>[number]['icon']

const payload = await getPayload({ config })
const log = (m: string) => payload.logger.info(`[seed] ${m}`)

/* admin user — only when none exists, so /admin never has an open "create first user" screen */
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
const users = await payload.find({ collection: 'users', limit: 1 })
if (users.totalDocs === 0) {
  if (email && password) {
    await payload.create({ collection: 'users', data: { email, password } })
    log('admin user created')
  } else {
    log('WARNING: no users and ADMIN_EMAIL / ADMIN_PASSWORD not set')
  }
}

const projects = await payload.find({ collection: 'projects', limit: 1 })
if (projects.totalDocs === 0) {
  for (const p of PROJECT_SEED) {
    await payload.create({
      collection: 'projects',
      data: {
        ...p,
        icon: p.icon as Project['icon'],
        pigment: p.pigment as Project['pigment'],
        stack: p.stack.map((name) => ({ name })),
        highlights: p.highlights.map((text) => ({ text })),
        featured: true,
      },
    })
  }
  log(`${PROJECT_SEED.length} islands charted`)
}

const faqs = await payload.find({ collection: 'faqs', limit: 1 })
if (faqs.totalDocs === 0) {
  let order = 1
  for (const f of FAQ_DEFAULTS) await payload.create({ collection: 'faqs', data: { ...f, order: order++ } })
  log(`${FAQ_DEFAULTS.length} questions added`)
}

const site = await payload.findGlobal({ slug: 'site' })
if (!site.heroLines?.length) {
  await payload.updateGlobal({
    slug: 'site',
    data: {
      heroEyebrow: SITE_DEFAULTS.heroEyebrow,
      heroLines: SITE_DEFAULTS.heroLines.map((line) => ({ line })),
      heroIntro: SITE_DEFAULTS.heroIntro,
      makes: SITE_DEFAULTS.makes.map((m) => ({ ...m, icon: m.icon as MakeIcon })),
      process: SITE_DEFAULTS.process,
      socials: SITE_DEFAULTS.socials,
    },
  })
  log('site words filled')
}

log('done')
process.exit(0)
