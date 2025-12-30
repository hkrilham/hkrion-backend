import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'
import {
  listLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  setDefaultLocation,
  seedDefaultLocation,
} from '../endpoints/businessLocation'

export const BusinessLocations: CollectionConfig = {
  slug: 'business-locations',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
  },
  endpoints: [
    { path: '/list', method: 'get', handler: listLocations },
    { path: '/seed-defaults', method: 'post', handler: seedDefaultLocation },
    { path: '/create', method: 'post', handler: createLocation },
    { path: '/:id', method: 'get', handler: getLocation },
    { path: '/:id', method: 'patch', handler: updateLocation },
    { path: '/:id', method: 'delete', handler: deleteLocation },
    { path: '/:id/set-default', method: 'post', handler: setDefaultLocation },
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
        description: 'Location name (e.g., Main Store, Branch 1)',
      },
    },
    {
      name: 'location_id',
      type: 'text',
      required: true,
      admin: {
        description: 'Location code (auto-generated if empty)',
      },
    },
    {
      name: 'landmark',
      type: 'text',
      admin: {
        description: 'Nearby landmark',
      },
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
      admin: {
        description: 'Phone number',
      },
    },
    {
      name: 'email',
      type: 'text',
      admin: {
        description: 'Email address',
      },
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
      relationTo: 'selling-price-groups',
      admin: {
        description: 'Default price group for this location',
      },
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
      admin: {
        description: 'Is this location active?',
      },
    },
    {
      name: 'is_default',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Is this the default location?',
      },
    },
  ],
}
