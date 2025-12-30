import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'category_name',
  },
  fields: [
    {
      name: 'category_name',
      type: 'text',
      required: true,
    },
    {
      name: 'category_code',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
    },
    {
      name: 'parent_category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'hsn_code',
      type: 'text',
    },
  ],
}
