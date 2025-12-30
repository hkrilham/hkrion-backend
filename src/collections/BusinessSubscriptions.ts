import type { CollectionConfig } from 'payload'

export const BusinessSubscriptions: CollectionConfig = {
  slug: 'business-subscriptions',
  admin: {
    useAsTitle: 'status',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'package', type: 'relationship', relationTo: 'subscription-packages', required: true },
    { name: 'status', type: 'text', defaultValue: 'active', required: true },
    { name: 'start_date', type: 'date', required: true },
    { name: 'end_date', type: 'date' },
    { name: 'trial_end_date', type: 'date' },
    { name: 'auto_renew', type: 'checkbox', defaultValue: true },
    { name: 'current_price', type: 'number', required: true },
    { name: 'billing_cycle', type: 'text', defaultValue: 'monthly' },
    { name: 'next_billing_date', type: 'date' },
    { name: 'payment_method', type: 'relationship', relationTo: 'subscription-payments' }, // maybe business-payment-methods? Schema says just payment_method_id.
    { name: 'notes', type: 'textarea' },
    { name: 'cancelled_at', type: 'date' },
    { name: 'cancelled_by', type: 'relationship', relationTo: 'users' },
  ],
}
