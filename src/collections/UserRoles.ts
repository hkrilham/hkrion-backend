import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'

export const UserRoles: CollectionConfig = {
  slug: 'user-roles',
  admin: {
    useAsTitle: 'name',
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
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'is_default',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
