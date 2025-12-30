import type { CollectionConfig } from 'payload'

export const SellingPriceGroups: CollectionConfig = {
  slug: 'selling-price-groups',
  admin: {
    useAsTitle: 'group_name',
  },
  fields: [
    { name: 'group_name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'color', type: 'text' },
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
  ],
}
