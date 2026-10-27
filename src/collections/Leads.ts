import type { CollectionConfig } from 'payload'

/* Quote requests from the "Get a quote" flow. Created server-side only. */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Quote request', plural: 'Quote requests' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'islandName', 'contact', 'createdAt', 'notified'],
    group: 'Inbox',
  },
  access: {
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'contact', type: 'text', required: true, admin: { description: 'Email or phone, as they typed it.' } },
    { name: 'islandName', type: 'text', label: 'Idea name' },
    { name: 'making', type: 'text', label: 'What they want made' },
    { name: 'stage', type: 'text', label: 'Where it is at' },
    { name: 'timing', type: 'text', label: 'When' },
    { name: 'idea', type: 'textarea', required: true, label: 'Their words' },
    { name: 'notified', type: 'checkbox', defaultValue: false, admin: { readOnly: true, description: 'Telegram alert sent.' } },
  ],
  timestamps: true,
}
