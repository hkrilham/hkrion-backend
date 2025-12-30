import type { CollectionConfig } from 'payload'

export const ReturnItems: CollectionConfig = {
  slug: 'return-items',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'return', type: 'relationship', relationTo: 'sales-returns', required: true }, // Need SalesReturns
    { name: 'sale_item', type: 'relationship', relationTo: 'sale-items', required: true }, // Need SaleItems
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'product_name', type: 'text', required: true },
    { name: 'quantity', type: 'number', required: true },
    { name: 'unit_price', type: 'number', required: true, defaultValue: 0 },
    { name: 'tax_rate', type: 'number', required: true, defaultValue: 0 },
    { name: 'tax_amount', type: 'number', required: true, defaultValue: 0 },
    { name: 'discount_amount', type: 'number', required: true, defaultValue: 0 },
    { name: 'subtotal', type: 'number', required: true, defaultValue: 0 },
    { name: 'total', type: 'number', required: true, defaultValue: 0 },
    { name: 'reason', type: 'textarea' },
    { name: 'condition', type: 'text' },
    { name: 'imei', type: 'text' },
    { name: 'serial_number', type: 'text' },
  ],
}
