import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import {
  listContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
} from '../endpoints/contact'

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  admin: {
    useAsTitle: 'first_name',
    group: 'CRM',
  },
  access: {
    read: disableRestApiAccess,
    update: disableRestApiAccess,
    delete: disableRestApiAccess,
    create: disableRestApiAccess,
  },
  endpoints: [
    { path: '/list', method: 'get', handler: listContacts },
    { path: '/create', method: 'post', handler: createContact },
    { path: '/:id', method: 'get', handler: getContact },
    { path: '/:id', method: 'patch', handler: updateContact },
    { path: '/:id', method: 'delete', handler: deleteContact },
  ],
  hooks: {
    beforeChange: [setBusinessOnCreate],
  },
  fields: [
    {
      name: 'contact_id',
      type: 'text',
      required: true,
      admin: {
        description: 'Auto-generated ID (CUS-XXXX / SUP-XXXX)',
      },
    },
    {
      name: 'contact_type',
      type: 'select',
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Supplier', value: 'supplier' },
        { label: 'Both', value: 'both' },
      ],
      defaultValue: 'customer',
      required: true,
      index: true,
    },
    {
      name: 'customer_type',
      type: 'select',
      options: [
        { label: 'Individual', value: 'individual' },
        { label: 'Business', value: 'business' },
      ],
      defaultValue: 'individual',
    },
    {
      name: 'prefix',
      type: 'text',
    },
    {
      name: 'first_name',
      type: 'text',
      required: true,
    },
    {
      name: 'last_name',
      type: 'text',
    },
    {
      name: 'business_name',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'mobile',
      type: 'text',
      index: true,
    },
    {
      name: 'alternate_contact_number',
      type: 'text',
    },
    {
      name: 'landline',
      type: 'text',
    },
    {
      name: 'customer_group',
      type: 'relationship',
      relationTo: 'customer-groups',
    },
    {
      name: 'assigned_to',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'tax_number',
      type: 'text',
    },
    {
      name: 'credit_limit',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'pay_term',
      type: 'text',
    },
    {
      name: 'opening_balance',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'advance_balance',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'address_line_1',
      type: 'text',
    },
    {
      name: 'address_line_2',
      type: 'text',
    },
    {
      name: 'city',
      type: 'text',
    },
    {
      name: 'state',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'zip_code',
      type: 'text',
    },
    {
      name: 'landmark',
      type: 'text',
    },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
      index: true, // For frequent business filtering
      admin: {
        condition: (data, siblingData, { user }) => {
          return user?.roles?.includes('admin') || false
        },
      },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'created_by',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}
