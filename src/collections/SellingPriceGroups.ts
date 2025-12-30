import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'
import {
  listPriceGroups,
  getPriceGroup,
  createPriceGroup,
  updatePriceGroup,
  deletePriceGroup,
} from '../endpoints/sellingPriceGroup'

export const SellingPriceGroups: CollectionConfig = {
  slug: 'selling-price-groups',
  admin: {
    useAsTitle: 'group_name',
    group: 'Settings',
  },
  endpoints: [
    { path: '/list', method: 'get', handler: listPriceGroups },
    { path: '/create', method: 'post', handler: createPriceGroup },
    { path: '/:id', method: 'get', handler: getPriceGroup },
    { path: '/:id', method: 'patch', handler: updatePriceGroup },
    { path: '/:id', method: 'delete', handler: deletePriceGroup },
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
      name: 'group_name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the price group (e.g., Retail, Wholesale)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of the price group',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Color for UI display (hex format, e.g., #FF5733)',
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
