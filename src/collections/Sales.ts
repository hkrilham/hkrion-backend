import type { CollectionConfig } from 'payload'

export const Sales: CollectionConfig = {
  slug: 'sales',
  admin: {
    useAsTitle: 'sale_number',
  },
  fields: [
    {
      name: 'sale_number',
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
      name: 'customer',
      type: 'relationship',
      relationTo: 'contacts',
    },
    {
      name: 'location',
      type: 'text', // String location? or relationship? Schema says text but also has business_location_id
    },
    {
      name: 'business_location',
      type: 'relationship',
      relationTo: 'business-locations',
    },
    {
      name: 'transaction_date',
      type: 'date',
      required: true,
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
    },
    {
      name: 'discount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'tax',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'shipping',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
    },
    {
      name: 'payment_method',
      type: 'text',
      defaultValue: 'cash',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'Pending', value: 'pending' },
        { label: 'Draft', value: 'draft' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'completed',
    },
    {
      name: 'created_by_user', // "created_by" is a reserved field in Payload (managed auto) usually
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'due_amount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'is_credit_sale',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'total_paid',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
