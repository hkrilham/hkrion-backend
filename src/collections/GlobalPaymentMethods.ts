import type { CollectionConfig } from 'payload'

export const GlobalPaymentMethods: CollectionConfig = {
  slug: 'global-payment-methods',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'code', type: 'text', required: true },
    { name: 'icon', type: 'text' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'is_available_for_business', type: 'checkbox', defaultValue: true },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
    { name: 'created_by', type: 'relationship', relationTo: 'users' },
  ],
}
