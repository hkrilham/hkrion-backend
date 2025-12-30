import type { CollectionConfig } from 'payload'

export const ProductLocations: CollectionConfig = {
  slug: 'product-locations',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'business_location', type: 'relationship', relationTo: 'business-locations', required: true },
    { name: 'business', type: 'relationship', relationTo: 'businesses' },
  ],
}
