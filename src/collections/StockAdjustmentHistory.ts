import type { CollectionConfig } from 'payload'

export const StockAdjustmentHistory: CollectionConfig = {
  slug: 'stock-adjustment-history',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'adjustment', type: 'relationship', relationTo: 'stock-adjustments', required: true }, // Need StockAdjustments
    { name: 'action', type: 'text', required: true },
    { name: 'performed_by', type: 'relationship', relationTo: 'users', required: true },
    { name: 'notes', type: 'textarea' },
  ],
}
