import type { CollectionConfig } from 'payload'

export const BusinessPaymentMethods: CollectionConfig = {
  slug: 'business-payment-methods',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'global_payment_method', type: 'relationship', relationTo: 'global-payment-methods', required: true }, // Need GlobalPaymentMethods
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'is_default', type: 'checkbox', defaultValue: false },
    { name: 'name', type: 'text', required: true },
    { name: 'code', type: 'text', required: true },
    { name: 'icon', type: 'text' },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
    { name: 'created_by', type: 'relationship', relationTo: 'users' },
  ],
}
