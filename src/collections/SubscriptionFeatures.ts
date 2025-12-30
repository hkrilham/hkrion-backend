import type { CollectionConfig } from 'payload'

export const SubscriptionFeatures: CollectionConfig = {
  slug: 'subscription-features',
  admin: {
    useAsTitle: 'feature_name',
  },
  fields: [
    { name: 'feature_name', type: 'text', required: true },
    { name: 'feature_code', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'category', type: 'text', defaultValue: 'features' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
  ],
}
