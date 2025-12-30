import type { CollectionConfig } from 'payload'

export const SubscriptionPackages: CollectionConfig = {
  slug: 'subscription-packages',
  admin: {
    useAsTitle: 'package_name',
  },
  fields: [
    { name: 'package_name', type: 'text', required: true },
    { name: 'package_code', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'price', type: 'number', required: true },
    { name: 'currency', type: 'text', defaultValue: 'USD' },
    { name: 'billing_cycle', type: 'text', defaultValue: 'monthly' },
    { name: 'features', type: 'json' }, // Or array of strings/relationships
    { name: 'max_users', type: 'number', defaultValue: 0 },
    { name: 'max_locations', type: 'number', defaultValue: 0 },
    { name: 'max_products', type: 'number', defaultValue: 0 },
    { name: 'max_storage_gb', type: 'number', defaultValue: 0 },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'is_popular', type: 'checkbox', defaultValue: false },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
    { name: 'created_by', type: 'relationship', relationTo: 'users' },
  ],
}
