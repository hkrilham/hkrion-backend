import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
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
  auth: true,
  fields: [
    // Email added by default
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
    },
    {
      name: 'roles', // Payload auth adds default roles but we might want custom ones or just rely on payload
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Cashier', value: 'cashier' },
      ],
      defaultValue: ['user'],
    },
  ],
}
