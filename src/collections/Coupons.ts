import type { CollectionConfig } from 'payload'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
  },
  fields: [
    { name: 'code', type: 'text', required: true },
    { name: 'discount_type', type: 'text', required: true },
    { name: 'discount_value', type: 'number', required: true },
    { name: 'min_purchase_amount', type: 'number', defaultValue: 0 },
    { name: 'valid_from', type: 'date', defaultValue: () => new Date() },
    { name: 'valid_until', type: 'date' },
    { name: 'usage_limit', type: 'number' },
    { name: 'usage_count', type: 'number', defaultValue: 0 },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'applicable_plans', type: 'json' }, // Text array in DB
    { name: 'created_by', type: 'relationship', relationTo: 'users' },
  ],
}
