import type { CollectionConfig } from 'payload'

export const CountryCodes: CollectionConfig = {
  slug: 'country-codes',
  admin: {
    useAsTitle: 'country_name',
  },
  fields: [
    { name: 'country_name', type: 'text', required: true },
    { name: 'country_code', type: 'text', required: true }, // e.g. IN
    { name: 'dialing_code', type: 'text', required: true }, // e.g. +91
    { name: 'flag_emoji', type: 'text' },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
  ],
}
