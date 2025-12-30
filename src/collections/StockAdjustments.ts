import type { CollectionConfig } from 'payload'

export const StockAdjustments: CollectionConfig = {
  slug: 'stock-adjustments',
  admin: {
    useAsTitle: 'adjustment_number',
  },
  fields: [
    { name: 'adjustment_number', type: 'text' },
    { name: 'location', type: 'relationship', relationTo: 'business-locations', required: true },
    { name: 'adjustment_date', type: 'date', defaultValue: () => new Date() },
    { name: 'adjustment_type', type: 'text', required: true },
    { name: 'reason', type: 'textarea' },
    { name: 'notes', type: 'textarea' },
    { name: 'total_items', type: 'number', defaultValue: 0 },
    { name: 'adjusted_by', type: 'relationship', relationTo: 'users', required: true },
    { name: 'status', type: 'text', defaultValue: 'draft' },
    { name: 'approved_by', type: 'relationship', relationTo: 'users' },
    { name: 'approved_at', type: 'date' },
  ],
}
