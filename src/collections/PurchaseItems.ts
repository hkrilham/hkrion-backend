import type { CollectionConfig } from 'payload'

export const PurchaseItems: CollectionConfig = {
  slug: 'purchase-items',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'purchase', type: 'relationship', relationTo: 'purchases', required: true },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'business_location', type: 'relationship', relationTo: 'business-locations' },
    { name: 'quantity', type: 'number', required: true, defaultValue: 1.0 },
    { name: 'unit_price', type: 'number', required: true, defaultValue: 0.0 },
    { name: 'default_selling_price', type: 'number', defaultValue: 0.0 },
    { name: 'tax_rate', type: 'number', defaultValue: 0.0 },
    { name: 'tax_amount', type: 'number', defaultValue: 0.0 },
    { name: 'discount_amount', type: 'number', defaultValue: 0.0 },
    { name: 'discount_type', type: 'text' },
    { name: 'total_amount', type: 'number', required: true, defaultValue: 0.0 },
    { name: 'received_quantity', type: 'number', required: true, defaultValue: 0.0 },
    { name: 'is_received', type: 'checkbox', defaultValue: false },
    { name: 'status', type: 'text', defaultValue: 'active' },
    { name: 'stock_price_entry', type: 'relationship', relationTo: 'product-stock-price' },
    { name: 'notes', type: 'textarea' },
  ],
}
