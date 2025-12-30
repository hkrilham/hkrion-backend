import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'
import {
  listCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../endpoints/category'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'category_name',
    group: 'Inventory',
  },
  endpoints: [
    { path: '/list', method: 'get', handler: listCategories },
    { path: '/tree', method: 'get', handler: getCategoryTree },
    { path: '/create', method: 'post', handler: createCategory },
    { path: '/:id', method: 'get', handler: getCategory },
    { path: '/:id', method: 'patch', handler: updateCategory },
    { path: '/:id', method: 'delete', handler: deleteCategory },
  ],
  access: {
    read: filterByBusiness,
    update: filterByBusiness,
    delete: filterByBusiness,
    create: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [setBusinessOnCreate],
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
      admin: {
        condition: (data, siblingData, { user }) => {
          return user?.roles?.includes('admin') || false
        },
      },
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
