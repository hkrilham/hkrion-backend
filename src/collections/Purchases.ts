import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'

export const Purchases: CollectionConfig = {
  slug: 'purchases',
  admin: {
    useAsTitle: 'purchase_number',
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
      name: 'purchase_number',
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
      name: 'supplier',
      type: 'relationship',
      relationTo: 'contacts',
    },
    {
      name: 'purchase_date',
      type: 'date',
      defaultValue: () => new Date(),
    },
    {
      name: 'due_date',
      type: 'date',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Received', value: 'received' },
        { label: 'Pending', value: 'pending' },
        { label: 'Ordered', value: 'ordered' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'subtotal',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'tax_amount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'discount_amount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'discount_type',
      type: 'select',
      options: [
        { label: 'Fixed', value: 'fixed' },
        { label: 'Percentage', value: 'percentage' },
      ],
    },
    {
      name: 'total_amount',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'paid_amount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'payment_status',
      type: 'select',
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Due', value: 'due' },
        { label: 'Partial', value: 'partial' },
        { label: 'Pending', value: 'pending' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'payment_method',
      type: 'text',
    },
    {
      name: 'reference_number',
      type: 'text',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
