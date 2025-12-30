import type { CollectionConfig } from 'payload'

export const SalePayments: CollectionConfig = {
  slug: 'sale-payments',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'sale', type: 'relationship', relationTo: 'sales', required: true },
    { name: 'payment_method_id', type: 'text' }, // or relation
    { name: 'payment_method_code', type: 'text', required: true },
    { name: 'payment_method_name', type: 'text', required: true },
    { name: 'amount', type: 'number', required: true },
    { name: 'reference_number', type: 'text' },
    { name: 'notes', type: 'textarea' },
    { name: 'created_by', type: 'relationship', relationTo: 'users' },
  ],
}
