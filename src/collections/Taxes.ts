import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'

export const Taxes: CollectionConfig = {
  slug: 'taxes',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
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
    { name: 'name', type: 'text', required: true },
    { name: 'rate', type: 'number', required: true },
    { name: 'type', type: 'select', options: ['percentage', 'fixed'], defaultValue: 'percentage' },
  ],
}
