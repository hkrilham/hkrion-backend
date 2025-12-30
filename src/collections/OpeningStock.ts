import type { CollectionConfig } from 'payload'

export const OpeningStock: CollectionConfig = {
  slug: 'opening-stock',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products' },
    { name: 'location', type: 'text', required: true }, // Schema says character varying, not relationship? Strange.
    { name: 'quantity', type: 'number', required: true, defaultValue: 0 },
    { name: 'unit_cost', type: 'number', required: true, defaultValue: 0 },
    { name: 'lot_number', type: 'text' },
    { name: 'subtotal', type: 'number', required: true, defaultValue: 0 },
  ],
}
