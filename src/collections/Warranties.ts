import type { CollectionConfig } from 'payload'

export const Warranties: CollectionConfig = {
  slug: 'warranties',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'duration', type: 'number', required: true },
    { name: 'duration_type', type: 'select', options: ['days', 'months', 'years'], defaultValue: 'months' },
    { name: 'business', type: 'relationship', relationTo: 'businesses' },
  ],
}
