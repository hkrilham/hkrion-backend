import type { CollectionConfig } from 'payload'

export const PermissionRequests: CollectionConfig = {
  slug: 'permission-requests',
  admin: {
    useAsTitle: 'permission_code',
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'permission_code', type: 'text', required: true },
    { name: 'reason', type: 'textarea' },
    { name: 'status', type: 'text', defaultValue: 'pending' },
    { name: 'requested_at', type: 'date', defaultValue: () => new Date() },
    { name: 'reviewed_at', type: 'date' },
    { name: 'reviewed_by', type: 'relationship', relationTo: 'users' },
    { name: 'reviewer_notes', type: 'textarea' },
  ],
}
