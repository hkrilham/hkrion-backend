import type { CollectionConfig } from 'payload'

export const BusinessDomains: CollectionConfig = {
  slug: 'business-domains',
  admin: {
    useAsTitle: 'domain',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'domain', type: 'text', required: true },
    { name: 'type', type: 'text', required: true },
    { name: 'is_verified', type: 'checkbox', defaultValue: false, required: true },
    { name: 'has_ssl', type: 'checkbox', defaultValue: false, required: true },
    { name: 'status', type: 'text', defaultValue: 'pending', required: true },
  ],
}
