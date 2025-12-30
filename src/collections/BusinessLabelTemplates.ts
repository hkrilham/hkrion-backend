import type { CollectionConfig } from 'payload'

export const BusinessLabelTemplates: CollectionConfig = {
  slug: 'business-label-templates',
  admin: {
    useAsTitle: 'template_name',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'template_name', type: 'text', required: true },
    { name: 'template_description', type: 'textarea' },
    { name: 'is_default', type: 'checkbox', defaultValue: false },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'label_width', type: 'number', required: true },
    { name: 'label_height', type: 'number', required: true },
    { name: 'gap_height', type: 'number', defaultValue: 3.0 },
    { name: 'layout_config', type: 'json', required: true },
    { name: 'preview_image_url', type: 'text' },
    { name: 'created_by', type: 'relationship', relationTo: 'users' },
  ],
}
