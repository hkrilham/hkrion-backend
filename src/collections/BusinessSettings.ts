import type { CollectionConfig } from 'payload'

export const BusinessSettings: CollectionConfig = {
  slug: 'business-settings',
  admin: {
    useAsTitle: 'setting_type',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses' },
    { name: 'setting_type', type: 'text', required: true },
    { name: 'settings', type: 'json' },
  ],
}
