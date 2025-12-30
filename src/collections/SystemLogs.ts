import type { CollectionConfig } from 'payload'

export const SystemLogs: CollectionConfig = {
  slug: 'system-logs',
  admin: {
    useAsTitle: 'message',
  },
  access: {
    read: ({ req }) => req.user?.roles?.includes('admin') || false,
    create: () => false, // Logs are system generated
    update: () => false,
    delete: ({ req }) => req.user?.roles?.includes('admin') || false,
  },
  fields: [
    { name: 'level', type: 'text', required: true },
    { name: 'service', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    { name: 'details', type: 'json' },
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'ip_address', type: 'text' },
    { name: 'user_agent', type: 'text' },
    { name: 'request_id', type: 'text' },
    { name: 'duration', type: 'number' },
    { name: 'status_code', type: 'number' },
  ],
}
