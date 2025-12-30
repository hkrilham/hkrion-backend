import type { CollectionConfig } from 'payload'

export const BusinessTrialUsage: CollectionConfig = {
  slug: 'business-trial-usage',
  admin: {
    useAsTitle: 'trial_used_at',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'trial_used_at', type: 'date', defaultValue: () => new Date() },
    { name: 'is_manual_override', type: 'checkbox', defaultValue: false },
    { name: 'overridden_by', type: 'relationship', relationTo: 'users' },
    { name: 'subscription', type: 'relationship', relationTo: 'business-subscriptions' },
  ],
}
