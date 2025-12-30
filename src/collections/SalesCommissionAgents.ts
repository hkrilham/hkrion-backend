import type { CollectionConfig } from 'payload'

export const SalesCommissionAgents: CollectionConfig = {
  slug: 'sales-commission-agents',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'contact_number', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'sales_commission_percentage', type: 'number', required: true },
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
  ],
}
