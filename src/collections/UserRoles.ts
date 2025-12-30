import type { CollectionConfig } from 'payload'

export const UserRoles: CollectionConfig = {
  slug: 'user-roles',
  admin: {
    useAsTitle: 'name',
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
