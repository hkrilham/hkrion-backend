import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'
import { listBrands, getBrand, createBrand, updateBrand, deleteBrand } from '../endpoints/brand'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'brand_name',
  },
  endpoints: [
    { path: '/list', method: 'get', handler: listBrands },
    { path: '/create', method: 'post', handler: createBrand },
    { path: '/:id', method: 'get', handler: getBrand },
    { path: '/:id', method: 'patch', handler: updateBrand },
    { path: '/:id', method: 'delete', handler: deleteBrand },
  ],
  access: {
    read: disableRestApiAccess,
    update: disableRestApiAccess,
    delete: disableRestApiAccess,
    create: disableRestApiAccess,
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
      // Hide from admin UI for non-admins to prevent confusion, or keep it read-only?
      // For now, let's just make it required. The hook handles assignment.
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
