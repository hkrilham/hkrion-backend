import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../endpoints/product'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    group: 'Inventory',
  },
  endpoints: [
    { path: '/list', method: 'get', handler: listProducts },
    { path: '/create', method: 'post', handler: createProduct },
    { path: '/:id', method: 'get', handler: getProduct },
    { path: '/:id', method: 'patch', handler: updateProduct },
    { path: '/:id', method: 'delete', handler: deleteProduct },
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
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Product name',
      },
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      admin: {
        description: 'Stock Keeping Unit (auto-generated if empty)',
      },
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
      name: 'image_url',
      type: 'text',
      admin: {
        description: 'Product image URL',
      },
    },
    {
      name: 'barcode_type',
      type: 'text',
      admin: {
        description: 'Barcode type (EAN-13, UPC-A, etc.)',
      },
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
      admin: {
        description: 'Product description',
      },
    },
    {
      name: 'is_serial_imei',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Track by serial number or IMEI',
      },
    },
    {
      name: 'units',
      type: 'relationship',
      relationTo: 'units',
      admin: {
        description: 'Unit of measurement',
      },
    },
    {
      name: 'warranties',
      type: 'relationship',
      relationTo: 'warranties',
      admin: {
        description: 'Product warranty',
      },
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
      admin: {
        description: 'Enable stock management',
      },
    },
    {
      name: 'alert_quantity',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Low stock alert threshold',
      },
    },
    {
      name: 'expiry_date',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Track expiry date',
      },
    },
  ],
}
