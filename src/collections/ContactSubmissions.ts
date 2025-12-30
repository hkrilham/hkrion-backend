import type { CollectionConfig } from 'payload'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'subject',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'subject', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    { name: 'category', type: 'text', defaultValue: 'general' },
    { name: 'status', type: 'text', defaultValue: 'new' }, // e.g. new, resolved
    { name: 'priority', type: 'text', defaultValue: 'medium' },
    { name: 'assigned_to', type: 'relationship', relationTo: 'users' },
    { name: 'admin_notes', type: 'textarea' },
    { name: 'response_sent', type: 'checkbox', defaultValue: false },
    { name: 'response_message', type: 'textarea' },
    { name: 'response_sent_at', type: 'date' },
    { name: 'response_sent_by', type: 'relationship', relationTo: 'users' },
  ],
}
