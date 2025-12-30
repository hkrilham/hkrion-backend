import type { CollectionConfig } from 'payload'

export const Permissions: CollectionConfig = {
  slug: 'permissions',
  admin: {
    useAsTitle: 'display_name',
  },
  fields: [
    { name: 'code', type: 'text', required: true },
    { name: 'display_name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'category', type: 'text', required: true },
    { name: 'subcategory', type: 'text' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
  ],
}
