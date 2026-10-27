import type { GlobalConfig } from 'payload'
import { ICON_KEYS } from '../lib/atlas'
import { revalidate } from '../lib/revalidate'

/* Site-wide words. Everything here has a sensible default in src/lib/content.ts. */
export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site words',
  access: { read: () => true },
  hooks: { afterChange: [() => revalidate('/', '/work')] },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero',
      fields: [
        { name: 'heroEyebrow', type: 'text' },
        {
          name: 'heroLines',
          type: 'array',
          admin: { description: 'Each line of the big headline. Wrap one word in *stars* to paint a brush stroke behind it.' },
          fields: [{ name: 'line', type: 'text', required: true }],
        },
        { name: 'heroIntro', type: 'textarea' },
      ],
    },
    {
      name: 'makes',
      type: 'array',
      label: 'Things I make (the currents)',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'icon', type: 'select', options: ICON_KEYS.map((k) => ({ label: k, value: k })) },
      ],
    },
    {
      name: 'process',
      type: 'array',
      label: 'How a project goes',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea', required: true },
      ],
    },
    {
      type: 'collapsible',
      label: 'Ways to reach me',
      fields: [
        { name: 'email', type: 'email', admin: { description: 'Shown publicly if set.' } },
        { name: 'whatsapp', type: 'text', admin: { description: 'Number with country code, digits only (e.g. 9198xxxxxxxx). Shown publicly if set.' } },
        { name: 'bookingUrl', type: 'text', admin: { description: 'Calendar link for a call. Shown if set.' } },
        {
          name: 'socials',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
