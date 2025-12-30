import type { CollectionConfig } from 'payload'

export const SeoAnalytics: CollectionConfig = {
  slug: 'seo-analytics',
  admin: {
    useAsTitle: 'date',
  },
  fields: [
    { name: 'date', type: 'date', required: true },
    { name: 'total_clicks', type: 'number', defaultValue: 0 },
    { name: 'total_impressions', type: 'number', defaultValue: 0 },
    { name: 'average_ctr', type: 'number', defaultValue: 0 },
    { name: 'average_position', type: 'number', defaultValue: 0 },
    { name: 'organic_sessions', type: 'number', defaultValue: 0 },
    { name: 'organic_users', type: 'number', defaultValue: 0 },
    { name: 'organic_pageviews', type: 'number', defaultValue: 0 },
    { name: 'organic_bounce_rate', type: 'number', defaultValue: 0 },
    { name: 'top_pages', type: 'json' },
    { name: 'top_keywords', type: 'json' },
    { name: 'lcp_score', type: 'number' },
    { name: 'fid_score', type: 'number' },
    { name: 'cls_score', type: 'number' },
  ],
}
