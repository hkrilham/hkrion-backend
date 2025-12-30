import type { CollectionConfig } from 'payload'

export const HomepageCMS: CollectionConfig = {
  slug: 'homepage-cms',
  admin: {
    useAsTitle: 'section_name',
  },
  fields: [
    { name: 'section_name', type: 'text', required: true },
    { name: 'section_type', type: 'text', required: true },
    { name: 'title', type: 'text' },
    { name: 'subtitle', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'content', type: 'json' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
    { name: 'created_by', type: 'relationship', relationTo: 'users' },
  ],
}
