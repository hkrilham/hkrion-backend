import type { CollectionConfig } from 'payload'

export const Units: CollectionConfig = {
  slug: 'units',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'short_name', type: 'text', required: true },
    { name: 'allow_decimal', type: 'checkbox', defaultValue: false },
    { name: 'business', type: 'relationship', relationTo: 'businesses' },
  ],
}
