import type { CollectionConfig } from 'payload'

export const BusinessLocations: CollectionConfig = {
  slug: 'business-locations',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'location_id',
      type: 'text',
      required: true,
    },
    {
      name: 'landmark',
      type: 'text',
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
    {
      name: 'state',
      type: 'text',
      required: true,
    },
    {
      name: 'zip_code',
      type: 'text',
      required: true,
    },
    {
      name: 'country',
      type: 'text',
      required: true,
    },
    {
      name: 'mobile',
      type: 'text',
    },
    {
      name: 'email',
      type: 'text',
    },
    {
      name: 'alternate_contact_number',
      type: 'text',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'invoice_scheme_pos',
      type: 'text',
      defaultValue: 'Default',
    },
    {
      name: 'invoice_layout_pos',
      type: 'text',
      defaultValue: 'Default',
    },
    {
      name: 'invoice_scheme_sale',
      type: 'text',
      defaultValue: 'Default',
    },
    {
      name: 'invoice_layout_sale',
      type: 'text',
      defaultValue: 'Default',
    },
    {
      name: 'default_selling_price_group',
      type: 'relationship',
      relationTo: 'selling-price-groups', // Assuming this slug
    },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'is_default',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
