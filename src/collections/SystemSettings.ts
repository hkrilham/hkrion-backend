import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'

export const SystemSettings: CollectionConfig = {
  slug: 'system-settings',
  admin: {
    useAsTitle: 'id',
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
    { name: 'theme_color', type: 'text' },
    { name: 'default_language', type: 'text' },
    { name: 'default_timezone', type: 'text' },
    { name: 'date_format', type: 'text' },
    { name: 'time_format', type: 'text' },
    { name: 'currency_symbol_position', type: 'select', options: ['before', 'after'] },
    { name: 'decimal_places', type: 'number' },
  ],
}
