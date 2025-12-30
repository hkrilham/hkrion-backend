import type { CollectionConfig } from 'payload'

export const Expenses: CollectionConfig = {
  slug: 'expenses',
  admin: {
    useAsTitle: 'expense_number',
  },
  fields: [
    {
      name: 'expense_number',
      type: 'text',
      required: true,
    },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
    },
    {
      name: 'expense_date',
      type: 'date',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'expense-categories', // Need to create this one
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'payment_method',
      type: 'text',
      defaultValue: 'cash',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'business-locations',
    },
    {
      name: 'supplier',
      type: 'relationship',
      relationTo: 'contacts',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'receipt_url',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Approved', value: 'approved' },
        { label: 'Pending', value: 'pending' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'approved',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
