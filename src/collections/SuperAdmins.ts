import type { CollectionConfig } from 'payload'

export const SuperAdmins: CollectionConfig = {
  slug: 'super-admins',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Only super admins can read/manage this
    read: ({ req }) => req.user?.roles?.includes('admin') || false,
    create: ({ req }) => req.user?.roles?.includes('admin') || false,
    update: ({ req }) => req.user?.roles?.includes('admin') || false,
    delete: ({ req }) => req.user?.roles?.includes('admin') || false,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'full_name',
      type: 'text',
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
