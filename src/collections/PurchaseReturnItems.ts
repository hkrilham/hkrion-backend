import type { CollectionConfig } from 'payload'

export const PurchaseReturnItems: CollectionConfig = {
  slug: 'purchase-return-items',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'return', type: 'relationship', relationTo: 'purchase-returns', required: true }, // Need PurchaseReturns
    { name: 'purchase_item', type: 'relationship', relationTo: 'purchase-items', required: true },
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
  ],
}
