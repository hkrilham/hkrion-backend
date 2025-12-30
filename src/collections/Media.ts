import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  access: {
    // Only authenticated users can read media
    read: ({ req }) => {
      // Allow if user is authenticated
      if (req.user) return true
      // Block unauthenticated access
      return false
    },
    // Only authenticated users can create
    create: ({ req }) => !!req.user,
    // Only owner business can update
    update: filterByBusiness,
    // Only owner business can delete
    delete: filterByBusiness,
  },
  hooks: {
    beforeChange: [setBusinessOnCreate],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      admin: {
        condition: (data, siblingData, { user }) => {
          return user?.roles?.includes('admin') || false
        },
      },
    },
  ],
  upload: true,
}
