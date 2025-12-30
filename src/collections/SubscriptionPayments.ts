import type { CollectionConfig } from 'payload'

export const SubscriptionPayments: CollectionConfig = {
  slug: 'subscription-payments',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'subscription', type: 'relationship', relationTo: 'business-subscriptions', required: true },
    { name: 'amount', type: 'number', required: true },
    { name: 'currency', type: 'text', defaultValue: 'USD' },
    { name: 'payment_method', type: 'text' },
    { name: 'payment_status', type: 'text', defaultValue: 'pending' },
    { name: 'transaction_id', type: 'text' },
    { name: 'payment_date', type: 'date', defaultValue: () => new Date() },
    { name: 'due_date', type: 'date' },
    { name: 'notes', type: 'textarea' },
  ],
}
