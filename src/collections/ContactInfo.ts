import type { CollectionConfig } from 'payload'

export const ContactInfo: CollectionConfig = {
  slug: 'contact-info',
  admin: {
    useAsTitle: 'label',
  },
  fields: [
    { name: 'type', type: 'text', required: true },
    { name: 'label', type: 'text', required: true },
    { name: 'value', type: 'text', required: true },
    { name: 'icon', type: 'text' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
  ],
}
