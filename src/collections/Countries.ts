import type { CollectionConfig } from 'payload'

export const Countries: CollectionConfig = {
  slug: 'countries',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'code', type: 'text', required: true }, // Country code, e.g. US
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    { name: 'currency', type: 'text' },
    { name: 'timezone_id', type: 'number' },
  ],
}
