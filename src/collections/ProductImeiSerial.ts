import type { CollectionConfig } from 'payload'

export const ProductImeiSerial: CollectionConfig = {
  slug: 'product-imei-serial',
  admin: {
    useAsTitle: 'serial', // or imei
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses' },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'product_stock_price', type: 'relationship', relationTo: 'product-stock-price' }, // need ProductStockPrice
    { name: 'type', type: 'text' },
    { name: 'imei', type: 'text' },
    { name: 'serial', type: 'text' },
    { name: 'is_sold', type: 'checkbox', defaultValue: false },
    { name: 'business_location', type: 'relationship', relationTo: 'business-locations' },
    { name: 'created_by', type: 'relationship', relationTo: 'users' },
  ],
}
