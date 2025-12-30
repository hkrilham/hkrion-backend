import type { CollectionConfig } from 'payload'

export const DiscountProducts: CollectionConfig = {
  slug: 'discount-products',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'discount', type: 'relationship', relationTo: 'discounts', required: true },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
  ],
}
