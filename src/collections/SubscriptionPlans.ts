import type { CollectionConfig } from 'payload'

export const SubscriptionPlans: CollectionConfig = {
  slug: 'subscription-plans',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'price', type: 'number', required: true },
    { name: 'billing_period', type: 'text', required: true, defaultValue: 'monthly' },
    { name: 'features', type: 'json' },
    { name: 'max_users', type: 'number', defaultValue: 5 },
    { name: 'max_businesses', type: 'number', defaultValue: 1 },
    { name: 'storage_limit_gb', type: 'number', defaultValue: 10 },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'is_popular', type: 'checkbox', defaultValue: false },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
  ],
}
