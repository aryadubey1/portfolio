import type { CollectionConfig } from 'payload'
import path from 'path'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
  upload: {
    // on the server uploads live outside the release folders so deploys never wipe them
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media'),
    imageSizes: [
      { name: 'card', width: 900 },
      { name: 'wide', width: 1800 },
    ],
    mimeTypes: ['image/*'],
  },
}
