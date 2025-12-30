import type { CollectionConfig } from 'payload'

export const OfficeLocations: CollectionConfig = {
  slug: 'office-locations',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'address', type: 'textarea', required: true },
    { name: 'city', type: 'text', required: true },
    { name: 'state', type: 'text' },
    { name: 'country', type: 'text', required: true },
    { name: 'postal_code', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'hours', type: 'textarea' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
  ],
}
