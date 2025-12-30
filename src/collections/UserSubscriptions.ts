import type { CollectionConfig } from 'payload'

export const UserSubscriptions: CollectionConfig = {
  slug: 'user-subscriptions',
  admin: {
    useAsTitle: 'status',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'plan',
      type: 'relationship',
      relationTo: 'subscription-plans',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Pending', value: 'pending' },
      ],
      required: true,
    },
    {
      name: 'start_date',
      type: 'date',
    },
    {
      name: 'end_date',
      type: 'date',
    },
    {
      name: 'auto_renew',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'payment_method',
      type: 'text',
    },
    {
      name: 'payment_status',
      type: 'text',
    },
    {
      name: 'amount_paid',
      type: 'number',
    },
    {
      name: 'next_billing_date',
      type: 'date',
    },
    {
      name: 'cancelled_at',
      type: 'date',
    },
    {
      name: 'cancellation_reason',
      type: 'textarea',
    },
  ],
}
