import type { CollectionConfig } from 'payload'

export const SeoPages: CollectionConfig = {
  slug: 'seo-pages',
  admin: {
    useAsTitle: 'page_title',
  },
  fields: [
    { name: 'page_slug', type: 'text', required: true },
    { name: 'page_title', type: 'text', required: true },
    { name: 'page_description', type: 'textarea' },
    { name: 'page_keywords', type: 'textarea' },
    { name: 'custom_title', type: 'text' },
    { name: 'custom_description', type: 'textarea' },
    { name: 'custom_keywords', type: 'textarea' },
    { name: 'og_title', type: 'text' },
    { name: 'og_description', type: 'textarea' },
    { name: 'og_image_url', type: 'text' },
    { name: 'og_type', type: 'text', defaultValue: 'article' },
    { name: 'twitter_title', type: 'text' },
    { name: 'twitter_description', type: 'textarea' },
    { name: 'twitter_image_url', type: 'text' },
    { name: 'structured_data', type: 'json' },
    { name: 'canonical_url', type: 'text' },
    { name: 'robots_index', type: 'checkbox', defaultValue: true },
    { name: 'robots_follow', type: 'checkbox', defaultValue: true },
    { name: 'robots_noarchive', type: 'checkbox', defaultValue: false },
    { name: 'robots_nosnippet', type: 'checkbox', defaultValue: false },
    { name: 'sitemap_include', type: 'checkbox', defaultValue: true },
    { name: 'sitemap_priority', type: 'number', defaultValue: 0.8 },
    { name: 'sitemap_changefreq', type: 'text', defaultValue: 'weekly' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
  ],
}
