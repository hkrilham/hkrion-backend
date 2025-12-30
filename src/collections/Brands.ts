import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'
import { listBrands, getBrand, createBrand, updateBrand, deleteBrand } from '../endpoints/brand'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'brand_name',
    group: 'Inventory',
  },
  endpoints: [
    { path: '/list', method: 'get', handler: listBrands },
    { path: '/create', method: 'post', handler: createBrand },
    { path: '/:id', method: 'get', handler: getBrand },
    { path: '/:id', method: 'patch', handler: updateBrand },
    { path: '/:id', method: 'delete', handler: deleteBrand },
  ],
  access: {
    // Filter by business - users can only see their own business brands
    read: filterByBusiness,
    update: filterByBusiness,
    delete: filterByBusiness,
    create: ({ req }) => !!req.user, // Any logged in user can create
  },
  hooks: {
    beforeChange: [setBusinessOnCreate],
  },
  fields: [
    {
      name: 'brand_name',
      type: 'text',
      required: true,
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
      admin: {
        condition: (data, siblingData, { user }) => {
          // Only show business field to admins
          return user?.roles?.includes('admin') || false
        },
      },
    },
    {
      name: 'logo_url',
      type: 'text',
    },
  ],
}
