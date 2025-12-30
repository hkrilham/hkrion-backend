import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'
import { listUnits, getUnit, createUnit, updateUnit, deleteUnit } from '../endpoints/unit'
import { getUnitGroups, getUnitsByGroup } from '../endpoints/unitConversion'
import { seedDefaultUnits } from '../endpoints/seedDefaultUnits'

export const Units: CollectionConfig = {
  slug: 'units',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
  },
  endpoints: [
    { path: '/list', method: 'get', handler: listUnits },
    { path: '/groups', method: 'get', handler: getUnitGroups },
    { path: '/by-group/:group', method: 'get', handler: getUnitsByGroup },
    { path: '/seed-defaults', method: 'post', handler: seedDefaultUnits },
    { path: '/create', method: 'post', handler: createUnit },
    { path: '/:id', method: 'get', handler: getUnit },
    { path: '/:id', method: 'patch', handler: updateUnit },
    { path: '/:id', method: 'delete', handler: deleteUnit },
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
        description: 'Full name (e.g., Kilogram)',
      },
    },
    {
      name: 'short_name',
      type: 'text',
      required: true,
      admin: {
        description: 'Abbreviation (e.g., kg)',
      },
    },
    {
      name: 'unit_group',
      type: 'select',
      required: true,
      defaultValue: 'COUNT',
      options: [
        { label: 'Mass (Weight)', value: 'MASS' },
        { label: 'Length', value: 'LENGTH' },
        { label: 'Volume', value: 'VOLUME' },
        { label: 'Area', value: 'AREA' },
        { label: 'Count/Quantity', value: 'COUNT' },
        { label: 'Time', value: 'TIME' },
        { label: 'Other', value: 'OTHER' },
      ],
      admin: {
        description: 'Category of measurement',
      },
    },
    {
      name: 'is_base_unit',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Is this the base unit for its group? (e.g., kg for MASS)',
      },
    },
    {
      name: 'allow_decimal',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
    },
  ],
}
