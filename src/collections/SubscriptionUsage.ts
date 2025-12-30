import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'

export const SubscriptionUsage: CollectionConfig = {
  slug: 'subscription-usage',
  admin: {
    useAsTitle: 'usage_type',
  },
  access: {
    read: filterByBusiness,
  },
  fields: [
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
    },
    {
      name: 'subscription',
      type: 'relationship',
      relationTo: 'business-subscriptions', // Mapped to business subscriptions
    },
    {
      name: 'usage_type',
      type: 'text',
      required: true,
    },
    {
      name: 'current_usage',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'limit_value',
      type: 'number',
    },
    {
      name: 'period_start',
      type: 'date',
      required: true,
    },
    {
      name: 'period_end',
      type: 'date',
      required: true,
    },
  ],
}
