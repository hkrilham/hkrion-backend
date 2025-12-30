import type { CollectionConfig } from 'payload'

export const Currencies: CollectionConfig = {
  slug: 'currencies',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'code', type: 'text', required: true }, // e.g. USD
    { name: 'name', type: 'text', required: true },
    { name: 'symbol', type: 'text' },
    { name: 'symbol_position', type: 'text', defaultValue: 'Before amount' },
    { name: 'decimal_places', type: 'number', defaultValue: 2 },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
  ],
}
