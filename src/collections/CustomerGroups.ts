import type { CollectionConfig } from 'payload'

export const CustomerGroups: CollectionConfig = {
  slug: 'customer-groups',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'calculation_percentage',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'price_calculation_type',
      type: 'select',
      options: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Selling Price Group', value: 'selling_price_group' },
      ],
      defaultValue: 'percentage',
    },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
