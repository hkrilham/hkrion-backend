import type { CollectionConfig } from 'payload'

export const Timezones: CollectionConfig = {
  slug: 'timezones',
  admin: {
    useAsTitle: 'display_name',
  },
  fields: [
    { name: 'name', type: 'text', required: true }, // e.g. Asia/Kolkata
    { name: 'display_name', type: 'text', required: true },
    { name: 'offset_hours', type: 'number', required: true },
    { name: 'offset_minutes', type: 'number' },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
  ],
}
