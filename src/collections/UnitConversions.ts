import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'
import {
  listConversions,
  createConversion,
  deleteConversion,
  convertUnits,
} from '../endpoints/unitConversion'

export const UnitConversions: CollectionConfig = {
  slug: 'unit_conversions',
  admin: {
    useAsTitle: 'id',
    group: 'Settings',
  },
  endpoints: [
    { path: '/list', method: 'get', handler: listConversions },
    { path: '/create', method: 'post', handler: createConversion },
    { path: '/convert', method: 'post', handler: convertUnits },
    { path: '/:id', method: 'delete', handler: deleteConversion },
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
      name: 'from_unit',
      type: 'relationship',
      relationTo: 'units',
      required: true,
      admin: {
        description: 'Source unit (e.g., Kilogram)',
      },
    },
    {
      name: 'to_unit',
      type: 'relationship',
      relationTo: 'units',
      required: true,
      admin: {
        description: 'Target unit (e.g., Gram)',
      },
    },
    {
      name: 'factor',
      type: 'number',
      required: true,
      admin: {
        description:
          'Conversion factor: 1 from_unit = X to_unit (e.g., 1 kg = 1000 g, factor = 1000)',
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
