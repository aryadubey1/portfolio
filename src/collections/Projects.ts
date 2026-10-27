import type { CollectionConfig } from 'payload'
import { ICON_KEYS, PIGMENTS, slugify } from '../lib/atlas'
import { revalidate } from '../lib/revalidate'

/* Every project is an island on the map. Add one here and it appears on the site. */
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Island (project)', plural: 'Islands (projects)' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'category', 'order', 'featured'],
    description: 'Each project becomes an island on the map and gets its own page at /work/<slug>.',
  },
  access: { read: () => true },
  defaultSort: 'order',
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.title) data.slug = slugify(data.title)
        return data
      },
    ],
    afterChange: [({ doc }) => revalidate('/', `/work/${doc.slug}`, '/sitemap.xml')],
    afterDelete: [({ doc }) => revalidate('/', `/work/${doc.slug}`, '/sitemap.xml')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'URL part. Filled from the title if left empty.' },
    },
    { name: 'tagline', type: 'text', admin: { description: 'One short line under the name.' } },
    { name: 'category', type: 'text', admin: { description: 'Free text, e.g. "Web app", "Website", "Mobile app".' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'live',
      required: true,
      options: [
        { label: 'Live', value: 'live' },
        { label: 'Building', value: 'building' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'icon',
      type: 'select',
      defaultValue: 'flag',
      options: ICON_KEYS.map((k) => ({ label: k, value: k })),
      admin: { position: 'sidebar', description: 'Pictogram on the island emblem.' },
    },
    {
      name: 'pigment',
      type: 'select',
      options: PIGMENTS.map((k) => ({ label: k, value: k })),
      admin: { position: 'sidebar', description: 'Island colour. Picked from the name if empty.' },
    },
    { name: 'summary', type: 'textarea', required: true, admin: { description: '2–3 sentences for the island card.' } },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'coverUrl', type: 'text', admin: { description: 'Or an image URL (used when no upload is set).' } },
    { name: 'liveUrl', type: 'text', admin: { description: 'Public link. The map checks it and shows a live pulse.' } },
    {
      name: 'stack',
      type: 'array',
      labels: { singular: 'Tool', plural: 'Tools' },
      fields: [{ name: 'name', type: 'text', required: true }],
    },
    {
      name: 'highlights',
      type: 'array',
      labels: { singular: 'Highlight', plural: 'Highlights' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'story',
      type: 'group',
      admin: { description: 'The case-study page.' },
      fields: [
        { name: 'problem', type: 'textarea', label: 'The problem' },
        { name: 'approach', type: 'textarea', label: 'What I built' },
        { name: 'outcome', type: 'textarea', label: 'How it turned out' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar', description: 'Show on the home map.' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar', description: 'Lower sails first.' } },
  ],
}
