import type { CollectionConfig } from 'payload'

export const Test: CollectionConfig = {
  slug: 'test',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text' },
    { name: 'imei', type: 'json' },
  ],
}
