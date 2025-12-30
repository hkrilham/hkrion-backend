import type { CollectionConfig } from 'payload'

export const LabelPrintHistory: CollectionConfig = {
  slug: 'label-print-history',
  admin: {
    useAsTitle: 'printed_at',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'template', type: 'relationship', relationTo: 'business-label-templates' },
    { name: 'printed_by', type: 'relationship', relationTo: 'users', required: true },
    { name: 'products_printed', type: 'json', required: true },
    { name: 'total_labels_printed', type: 'number', required: true },
    { name: 'settings_used', type: 'json', required: true },
    { name: 'status', type: 'text', defaultValue: 'completed' },
    { name: 'error_message', type: 'textarea' },
    { name: 'printed_at', type: 'date', defaultValue: () => new Date() },
  ],
}
