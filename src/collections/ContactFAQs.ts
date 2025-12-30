import type { CollectionConfig } from 'payload'

export const ContactFAQs: CollectionConfig = {
  slug: 'contact-faqs',
  admin: {
    useAsTitle: 'question',
  },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
    { name: 'category', type: 'text', defaultValue: 'general' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
  ],
}
