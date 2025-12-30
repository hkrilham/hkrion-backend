import type { CollectionConfig } from 'payload'

export const SeoIssues: CollectionConfig = {
  slug: 'seo-issues',
  admin: {
    useAsTitle: 'issue_title',
  },
  fields: [
    { name: 'issue_type', type: 'text', required: true },
    { name: 'issue_severity', type: 'text', required: true, defaultValue: 'medium' },
    { name: 'issue_title', type: 'text', required: true },
    { name: 'issue_description', type: 'textarea' },
    { name: 'affected_url', type: 'text' },
    { name: 'affected_page_slug', type: 'text' },
    { name: 'error_code', type: 'text' },
    { name: 'error_message', type: 'textarea' },
    { name: 'technical_details', type: 'json' },
    { name: 'is_resolved', type: 'checkbox', defaultValue: false },
    { name: 'resolved_at', type: 'date' },
    { name: 'resolution_notes', type: 'textarea' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
  ],
}
