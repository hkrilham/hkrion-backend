import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  admin: {
    useAsTitle: 'first_name',
  },
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
      name: 'contact_id',
      type: 'text',
      required: true,
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
  ],
}
