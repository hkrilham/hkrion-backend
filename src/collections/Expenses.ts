import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'

export const Expenses: CollectionConfig = {
  slug: 'expenses',
  admin: {
    useAsTitle: 'expense_number',
  },
  access: {
    read: filterByBusiness,
    update: filterByBusiness,
    delete: filterByBusiness,
    create: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [setBusinessOnCreate],
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
      admin: {
        condition: (data, siblingData, { user }) => {
          return user?.roles?.includes('admin') || false
        },
      },
    },
    {
      name: 'expense_date',
      type: 'date',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'expense-categories',
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
