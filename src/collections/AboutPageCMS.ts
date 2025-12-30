import type { CollectionConfig } from 'payload'

export const AboutPageCMS: CollectionConfig = {
  slug: 'about-page-cms',
  admin: {
    useAsTitle: 'section_name',
  },
  fields: [
    { name: 'section_name', type: 'text', required: true },
    { name: 'section_type', type: 'text', required: true },
    { name: 'title', type: 'text' },
    { name: 'subtitle', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'content', type: 'richText' }, // text in DB, but usually rich text in CMS
    { name: 'image_url', type: 'text' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
  ],
}
