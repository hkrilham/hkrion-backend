import type { CollectionConfig } from 'payload'
import { filterOwnBusiness } from '../hooks/filterOwnBusiness'
import { registerBusiness } from '../endpoints/Business/registerBusiness'
import { getMyBusiness, updateMyBusiness } from '../endpoints/Business/myBusiness'

export const Businesses: CollectionConfig = {
  slug: 'businesses',
  admin: {
    useAsTitle: 'business_name',
    group: 'System',
  },
  endpoints: [
    {
      path: '/register',
      method: 'post',
      handler: registerBusiness,
    },
    {
      path: '/me',
      method: 'get',
      handler: getMyBusiness,
    },
    {
      path: '/me',
      method: 'patch',
      handler: updateMyBusiness,
    },
  ],
  access: {
    // Users can only see their own business
    read: filterOwnBusiness,
    update: filterOwnBusiness,
    delete: ({ req }) => false, // No one can delete businesses via API
    create: ({ req }) => false, // Use /register endpoint instead
  },
  // NOTE: Default units are created in registerBusiness endpoint
  fields: [
    {
      name: 'business_name',
      type: 'text',
      required: true,
    },
    {
      name: 'start_date',
      type: 'date',
    },
    {
      name: 'logo_url',
      type: 'text', // Could be upload relationship if using Media
    },
    {
      name: 'business_contact',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
      required: true,
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
    {
      name: 'landmark',
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
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      required: true,
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'alternate_contact',
      type: 'text',
    },
    {
      name: 'timezone',
      type: 'text',
      defaultValue: 'Asia/Kolkata',
      required: true,
    },
    {
      name: 'tax1_name',
      type: 'text',
    },
    {
      name: 'tax1_number',
      type: 'text',
    },
    {
      name: 'tax2_name',
      type: 'text',
    },
    {
      name: 'tax2_number',
      type: 'text',
    },
    {
      name: 'financial_year_start',
      type: 'text',
      defaultValue: 'January',
      required: true,
    },
    {
      name: 'stock_accounting_method',
      type: 'text',
      defaultValue: 'FIFO (First In First Out)',
      required: true,
    },
  ],
}
