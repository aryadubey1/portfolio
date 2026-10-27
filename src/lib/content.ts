/* Default words for the site. The CMS overrides any of these once filled in,
   and the seed script copies them into the CMS on first deploy.
   Rule for every line here: nothing may sound limiting. */

export const SITE_DEFAULTS = {
  heroEyebrow: "Arya Dubey · an atlas of things I've built",
  heroLines: ['Bring the idea.', 'Leave with the', '*finished* thing.'],
  heroIntro:
    "I design, build and launch whatever an idea needs, from the first rough sketch to the live thing people use. Then I stay around to look after it. Here's the map so far.",
  makes: [
    { label: 'Websites', icon: 'globe' },
    { label: 'Web apps', icon: 'layers' },
    { label: 'Mobile apps', icon: 'phone' },
    { label: 'Dashboards', icon: 'chart' },
    { label: 'Online stores', icon: 'cart' },
    { label: 'Bookings & payments', icon: 'card' },
    { label: 'Automations', icon: 'bolt' },
    { label: 'AI assistants', icon: 'spark' },
    { label: 'Internal tools', icon: 'sliders' },
    { label: 'APIs & backends', icon: 'server' },
    { label: 'Billing & invoicing', icon: 'receipt' },
    { label: 'Chat & messaging', icon: 'chat' },
  ],
  process: [
    { title: 'Talk', text: 'Tell me the idea, however rough. I ask the questions that give it shape.' },
    { title: 'Plan & quote', text: 'You get a clear plan: what gets built, in what order, and a quote to match.' },
    { title: 'Build', text: 'I build in the open. You see it working early and steer it as it grows.' },
    { title: 'Launch & look after', text: 'It goes live, everything is handed to you, and I stay close for what comes next.' },
  ],
  email: null as string | null,
  whatsapp: null as string | null,
  bookingUrl: null as string | null,
  socials: [
    { label: 'GitHub', url: 'https://github.com/aryadubey1' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/aryadubey1' },
    { label: 'X', url: 'https://x.com/_aryadubey' },
  ],
}

export type SiteWords = typeof SITE_DEFAULTS

export const FAQ_DEFAULTS = [
  {
    question: 'What can you build?',
    answer:
      "If it lives on a screen, very likely. Websites, web and mobile apps, dashboards, automations, AI assistants, and the odd thing nobody has a name for yet. Tell me the problem and we'll work out the right shape for it together.",
  },
  {
    question: 'Which technologies do you use?',
    answer:
      'Whichever fits the problem. The islands on this map were built with different tools for different jobs. I pick what is fast, solid, and easy for you to own long after launch.',
  },
  {
    question: 'How do quotes work?',
    answer:
      "Tell me about the idea. I'll come back with a few questions, then a clear plan and a quote, so you know exactly what you're getting before anything starts.",
  },
  {
    question: 'How long does it take?',
    answer:
      "It depends on what we're making. You get a timeline with the quote, and you see working progress along the way, not only at the end.",
  },
  {
    question: 'Do I own what you build?',
    answer: 'Yes. The code, the designs, the accounts and the domain are all yours.',
  },
  {
    question: 'Can we work together from anywhere?',
    answer: "Yes. I'm based in Bhopal, India, and I work with people wherever they are, over calls, chat and email.",
  },
  {
    question: 'What happens after launch?',
    answer: "I don't vanish. Fixes, improvements and new features are a message away.",
  },
]

const cdn = (u: string) => u.replace('http://', 'https://')

/* The four live projects carried over from the old site's database (2026-10-27).
   Story fields are a starting point — edit them in /admin. */
export const PROJECT_SEED = [
  {
    title: 'InvoiceHub',
    slug: 'invoicehub',
    tagline: 'Invoicing, stock and cashflow in one place',
    category: 'Web app · SaaS',
    status: 'live' as const,
    icon: 'receipt',
    pigment: 'honey',
    summary:
      'A multi-tenant invoicing platform: GST-ready invoices as PDFs, stock that updates itself with every sale, and live revenue dashboards. In daily use by a jewellery business.',
    coverUrl: cdn('http://res.cloudinary.com/dkfcrs9df/image/upload/v1779341336/portfolio/projects/voaj4mwrsfrnuahwuydm.png'),
    liveUrl: 'https://invoicehub.aryadubey.tech',
    stack: ['Django', 'PostgreSQL', 'Tailwind CSS', 'Chart.js', 'WeasyPrint', 'Google OAuth', 'Nginx', 'Linux VPS'],
    highlights: [
      'Every business gets its own walled-off books (multi-tenant)',
      'GST invoices rendered to PDF in one click',
      'Stock deducted automatically on every sale',
      'Revenue and cashflow dashboards that update in real time',
      'Google sign-in',
    ],
    story: {
      problem:
        'A business that sells high-value stock needs invoices that are right for GST, stock counts that match the shelf, and a clear view of the cash. Usually that means three tools that never agree.',
      approach:
        'One platform that does all three. Invoices are generated as print-ready PDFs, every sale deducts stock on its own, and dashboards turn the numbers into something you can read at a glance. Multi-tenant from day one, so each business stays separate.',
      outcome: 'Live, on a server I set up and run myself, and used every day by a jewellery business.',
    },
    order: 1,
  },
  {
    title: 'GymHub',
    slug: 'gymhub',
    tagline: 'Gym management, one space per gym',
    category: 'Web app · SaaS',
    status: 'live' as const,
    icon: 'people',
    pigment: 'mint',
    summary: 'Multi-tenant gym management software. Each gym gets its own space and dashboard to run the day-to-day.',
    coverUrl: cdn('http://res.cloudinary.com/dkfcrs9df/image/upload/v1782458821/portfolio/projects/rq8gltbr9lyf8zst4x4g.png'),
    liveUrl: 'https://gymhub.aryadubey.tech/',
    stack: ['Django', 'PostgreSQL', 'Tailwind CSS', 'Python'],
    highlights: ['Multi-tenant: one install, many gyms', 'A dashboard for each gym'],
    story: {
      problem: 'Gyms juggle members, plans and payments across notebooks and chats.',
      approach: 'A single multi-tenant app where every gym gets its own private space and dashboard.',
      outcome: 'Live and open to explore.',
    },
    order: 2,
  },
  {
    title: 'FitForge',
    slug: 'fitforge',
    tagline: 'A gym website the owner runs themselves',
    category: 'Website',
    status: 'live' as const,
    icon: 'dumbbell',
    pigment: 'coral',
    summary:
      'A media-rich gym website where courses, programs, trainers and services are all editable from an admin panel, with an enquiry form that brings in leads.',
    coverUrl: cdn('http://res.cloudinary.com/dkfcrs9df/image/upload/v1779344921/portfolio/projects/cdsb6nxwb4gokbsmausg.jpg'),
    liveUrl: 'https://fitforge.aryadubey.tech/',
    stack: ['Django', 'Python', 'Tailwind CSS'],
    highlights: [
      'Full admin control over courses, programs, services and trainers',
      'Media-rich hero gallery',
      'Enquiry form that captures leads',
    ],
    story: {
      problem: 'A gym needs a professional presence it can keep up to date without calling a developer for every change.',
      approach: 'A fast, visual site with every section editable from an admin panel, plus an enquiry form wired for leads.',
      outcome: 'Live and ready for any gym to make its own.',
    },
    order: 3,
  },
  {
    title: 'Lumière',
    slug: 'lumiere',
    tagline: 'A premium home for interior design studios',
    category: 'Website',
    status: 'live' as const,
    icon: 'lamp',
    pigment: 'sand',
    summary:
      'A gallery-led site for interior design studios: projects, team, services and programs managed from an admin, and an enquiry form built to catch serious leads.',
    coverUrl: cdn('http://res.cloudinary.com/dkfcrs9df/image/upload/v1779347645/portfolio/projects/qmyebzhl9b5k1oqft4ez.jpg'),
    liveUrl: 'https://lumiere.aryadubey.tech/',
    stack: ['Django', 'PostgreSQL', 'Tailwind CSS', 'Python'],
    highlights: [
      'Premium, image-first visual design',
      'Projects, team and services managed from an admin',
      'Lead-focused enquiry form',
    ],
    story: {
      problem: "A design studio's website has to feel as considered as its work, and still be easy to update.",
      approach: 'An image-first design with full admin control over every project, person and service.',
      outcome: 'Live and ready to carry a studio’s portfolio.',
    },
    order: 4,
  },
]
