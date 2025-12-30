import type { CollectionConfig } from 'payload'

export const SaleItems: CollectionConfig = {
  slug: 'sale-items',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'sale', type: 'relationship', relationTo: 'sales', required: true },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'product_name', type: 'text', required: true },
    { name: 'quantity', type: 'number', required: true, defaultValue: 1.0 },
    { name: 'unit_price', type: 'number', required: true, defaultValue: 0 },
    { name: 'tax_rate', type: 'number', required: true, defaultValue: 0 },
    { name: 'tax_amount', type: 'number', required: true, defaultValue: 0 },
    { name: 'discount_amount', type: 'number', required: true, defaultValue: 0 },
    { name: 'subtotal', type: 'number', required: true, defaultValue: 0 },
    { name: 'total', type: 'number', required: true, defaultValue: 0 },
    { name: 'imei', type: 'text' },
    { name: 'serial_number', type: 'text' },
  ],
}
