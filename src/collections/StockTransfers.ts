import type { CollectionConfig } from 'payload'

export const StockTransfers: CollectionConfig = {
  slug: 'stock-transfers',
  admin: {
    useAsTitle: 'reference_no',
  },
  fields: [
    { name: 'reference_no', type: 'text', required: true },
    { name: 'source_location', type: 'relationship', relationTo: 'business-locations' },
    { name: 'destination_location', type: 'relationship', relationTo: 'business-locations' },
    { name: 'status', type: 'text', required: true },
    { name: 'transfer_date', type: 'date', required: true, defaultValue: () => new Date() },
    { name: 'notes', type: 'textarea' },
    { name: 'created_by', type: 'relationship', relationTo: 'users' },
    { name: 'shipping_charges', type: 'number', defaultValue: 0 },
  ],
}
