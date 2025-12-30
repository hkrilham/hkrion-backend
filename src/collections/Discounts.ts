import type { CollectionConfig } from 'payload'

export const Discounts: CollectionConfig = {
  slug: 'discounts',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'discount_type', type: 'text', required: true },
    { name: 'discount_amount', type: 'number', required: true },
    { name: 'location', type: 'relationship', relationTo: 'business-locations', required: true },
    { name: 'brand', type: 'relationship', relationTo: 'brands' },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    { name: 'selling_price_group', type: 'relationship', relationTo: 'selling-price-groups' },
    { name: 'priority', type: 'number', defaultValue: 0 },
    { name: 'starts_at', type: 'date' },
    { name: 'ends_at', type: 'date' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'apply_in_customer_groups', type: 'checkbox', defaultValue: false },
    { name: 'created_by', type: 'relationship', relationTo: 'users' },
  ],
}
