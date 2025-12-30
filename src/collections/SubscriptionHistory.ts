import type { CollectionConfig } from 'payload'

export const SubscriptionHistory: CollectionConfig = {
  slug: 'subscription-history',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'subscription', type: 'relationship', relationTo: 'business-subscriptions' },
    { name: 'action', type: 'text', required: true },
    { name: 'old_package', type: 'relationship', relationTo: 'subscription-packages' },
    { name: 'new_package', type: 'relationship', relationTo: 'subscription-packages' },
    { name: 'old_price', type: 'number' },
    { name: 'new_price', type: 'number' },
    { name: 'changed_by', type: 'relationship', relationTo: 'users' },
    { name: 'notes', type: 'textarea' },
  ],
}
