import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'
import {
  listWarranties,
  getWarranty,
  createWarranty,
  updateWarranty,
  deleteWarranty,
} from '../endpoints/warranty'

export const Warranties: CollectionConfig = {
  slug: 'warranties',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
  },
  endpoints: [
    { path: '/list', method: 'get', handler: listWarranties },
    { path: '/create', method: 'post', handler: createWarranty },
    { path: '/:id', method: 'get', handler: getWarranty },
    { path: '/:id', method: 'patch', handler: updateWarranty },
    { path: '/:id', method: 'delete', handler: deleteWarranty },
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
        description: 'Warranty name (e.g., "1 Year Standard")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Warranty terms and conditions',
      },
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Duration value (e.g., 12)',
      },
    },
    {
      name: 'duration_type',
      type: 'select',
      options: [
        { label: 'Days', value: 'days' },
        { label: 'Months', value: 'months' },
        { label: 'Years', value: 'years' },
      ],
      defaultValue: 'months',
      admin: {
        description: 'Duration unit',
      },
    },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
    },
  ],
}
