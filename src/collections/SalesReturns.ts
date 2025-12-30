import type { CollectionConfig } from 'payload'

export const SalesReturns: CollectionConfig = {
  slug: 'sales-returns',
  admin: {
    useAsTitle: 'return_number',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'return_number', type: 'text', required: true },
    { name: 'original_sale', type: 'relationship', relationTo: 'sales', required: true },
    { name: 'customer', type: 'relationship', relationTo: 'contacts' },
    { name: 'return_date', type: 'date', required: true, defaultValue: () => new Date() },
    { name: 'subtotal', type: 'number', required: true, defaultValue: 0.00 },
    { name: 'discount', type: 'number', required: true, defaultValue: 0.00 },
    { name: 'tax', type: 'number', required: true, defaultValue: 0.00 },
    { name: 'shipping', type: 'number', required: true, defaultValue: 0.00 },
    { name: 'total_amount', type: 'number', required: true, defaultValue: 0.00 },
    { name: 'status', type: 'text', required: true, defaultValue: 'pending' },
    { name: 'reason', type: 'textarea' },
    { name: 'refund_method', type: 'text' },
    { name: 'notes', type: 'textarea' },
    { name: 'created_by', type: 'relationship', relationTo: 'users', required: true },
  ],
}
