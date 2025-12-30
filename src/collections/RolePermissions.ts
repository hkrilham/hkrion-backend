import type { CollectionConfig } from 'payload'

export const RolePermissions: CollectionConfig = {
  slug: 'role-permissions',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'role_id', type: 'text', required: true }, // Or relationship to roles if it exists? 'Users' has roles? Usually role is a string in Payload auth.
    { name: 'permission', type: 'relationship', relationTo: 'permissions', required: true },
    { name: 'settings', type: 'json' },
    { name: 'granted_at', type: 'date', defaultValue: () => new Date() },
    { name: 'granted_by', type: 'relationship', relationTo: 'users' },
  ],
}
