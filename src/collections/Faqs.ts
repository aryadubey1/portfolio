import type { CollectionConfig } from 'payload'
import { revalidate } from '../lib/revalidate'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'Question', plural: 'Questions' },
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'order'] },
  access: { read: () => true },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => revalidate('/')],
    afterDelete: [() => revalidate('/')],
  },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
