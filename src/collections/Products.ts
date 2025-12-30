import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
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
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
    },
    {
      name: 'image_url',
      type: 'text',
    },
    {
      name: 'sku',
      type: 'text',
    },
    {
      name: 'barcode_type',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'is_serial_imei',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'units',
      type: 'relationship',
      relationTo: 'units',
    },
    {
      name: 'warranties',
      type: 'relationship',
      relationTo: 'warranties',
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'manage_stock',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'alert_quantity',
      type: 'number',
    },
    {
      name: 'expiry_date',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
