import type { CollectionConfig } from 'payload'

export const PackageFeatures: CollectionConfig = {
  slug: 'package-features',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'package', type: 'relationship', relationTo: 'subscription-packages', required: true },
    { name: 'feature', type: 'relationship', relationTo: 'subscription-features', required: true }, // Need SubscriptionFeatures
    { name: 'limit_value', type: 'number' },
    { name: 'is_unlimited', type: 'checkbox', defaultValue: false },
  ],
}
