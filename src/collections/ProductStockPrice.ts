import type { CollectionConfig } from 'payload'

export const ProductStockPrice: CollectionConfig = {
  slug: 'product-stock-price',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses' },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'supplier', type: 'relationship', relationTo: 'contacts' },
    { name: 'unit_price', type: 'number', defaultValue: 0 },
    { name: 'default_selling_price', type: 'number', defaultValue: 0 },
    { name: 'stock', type: 'number', defaultValue: 0 },
    { name: 'sold', type: 'number', defaultValue: 0 },
    { name: 'status', type: 'text', defaultValue: 'active' },
    { name: 'note', type: 'textarea' },
    { name: 'business_location', type: 'relationship', relationTo: 'business-locations' },
    { name: 'manufacturing_date', type: 'date' },
    { name: 'expiry_date', type: 'date' },
    { name: 'created_by', type: 'relationship', relationTo: 'users' },
  ],
}
