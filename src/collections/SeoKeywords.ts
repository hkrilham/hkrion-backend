import type { CollectionConfig } from 'payload'

export const SeoKeywords: CollectionConfig = {
  slug: 'seo-keywords',
  admin: {
    useAsTitle: 'keyword',
  },
  fields: [
    { name: 'keyword', type: 'text', required: true },
    { name: 'target_url', type: 'text' },
    { name: 'target_page_slug', type: 'text' },
    { name: 'search_volume', type: 'number', defaultValue: 0 },
    { name: 'difficulty_score', type: 'number', defaultValue: 0 },
    { name: 'current_ranking', type: 'number' },
    { name: 'target_ranking', type: 'number' },
    { name: 'last_checked', type: 'date' },
    { name: 'ranking_history', type: 'json' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'is_primary', type: 'checkbox', defaultValue: false },
  ],
}
