import type { CollectionConfig } from 'payload'

export const Prefixes: CollectionConfig = {
  slug: 'prefixes',
  admin: {
    useAsTitle: 'display_name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'display_name', type: 'text', required: true },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
  ],
}
