import type { CollectionConfig } from 'payload'

export const StockAdjustmentItems: CollectionConfig = {
  slug: 'stock-adjustment-items',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'adjustment', type: 'relationship', relationTo: 'stock-adjustments', required: true },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'current_quantity', type: 'number', defaultValue: 0 },
    { name: 'adjusted_quantity', type: 'number', required: true },
    { name: 'new_quantity', type: 'number', required: true },
    { name: 'unit_cost', type: 'number', defaultValue: 0 },
    { name: 'total_cost', type: 'number', defaultValue: 0 },
    { name: 'reason', type: 'textarea' },
    { name: 'imei_number', type: 'text' },
  ],
}
