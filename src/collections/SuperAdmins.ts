import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../hooks/isSuperAdmin'

export const SuperAdmins: CollectionConfig = {
  slug: 'super-admins',
  admin: {
    useAsTitle: 'email',
    group: 'System',
    description:
      'HKRiON Staff with full system access. Only existing super admins can manage this.',
  },
  access: {
    // SECURITY: Only verified super admins can access this collection
    // Regular business admins CANNOT access this
    read: isSuperAdmin,
    create: isSuperAdmin,
    update: isSuperAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: {
        description: 'The user account to grant super admin access',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Email for quick reference (should match user email)',
      },
    },
    {
      name: 'full_name',
      type: 'text',
      admin: {
        description: 'Full name of the super admin',
      },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Uncheck to temporarily revoke super admin access without deleting',
      },
    },
    // Audit fields
    {
      name: 'added_by',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        description: 'Who added this super admin',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this super admin',
      },
    },
  ],
  hooks: {
    beforeChange: [
      // Auto-set added_by on create
      async ({ data, operation, req }) => {
        if (operation === 'create' && req.user) {
          data.added_by = req.user.id
        }
        return data
      },
    ],
  },
}
