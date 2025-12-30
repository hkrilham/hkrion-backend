import type { CollectionConfig } from 'payload'

export const UserLocations: CollectionConfig = {
  slug: 'user-locations',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'business_location',
      type: 'relationship',
      relationTo: 'business-locations',
      required: true,
    },
    {
      name: 'is_primary',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
