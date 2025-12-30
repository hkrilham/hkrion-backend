import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'

export const Taxes: CollectionConfig = {
  slug: 'taxes',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: disableRestApiAccess,
    update: disableRestApiAccess,
    delete: disableRestApiAccess,
    create: disableRestApiAccess,
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
