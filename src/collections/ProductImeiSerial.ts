import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'
import { filterByBusiness } from '../hooks/filterByBusiness'

export const ProductImeiSerial: CollectionConfig = {
  slug: 'product-imei-serial', // Reverted to avoid DB migration prompt
  admin: {
    useAsTitle: 'serial_number',
    group: 'Inventory',
    defaultColumns: ['serial_number', 'product', 'status', 'business_location'],
  },
  access: {
    read: filterByBusiness,
    update: filterByBusiness,
    delete: filterByBusiness,
    create: disableRestApiAccess, // Created via API endpoints Only
  },
  hooks: {
    beforeChange: [setBusinessOnCreate],
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
    },
    {
      name: 'stock_batch',
      type: 'relationship',
      relationTo: 'product-stock-price',
      required: true,
      index: true,
      admin: {
        description: 'Linked to specific stock entry',
      },
    },
    {
      name: 'serial_number',
      type: 'text',
      required: true,
      label: 'IMEI / Serial Number',
      index: true,
      // unique: true, // Unique per business validation handled in code/hooks to allow cross-business uniqueness if needed
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Sold', value: 'sold' },
        { label: 'Returned', value: 'returned' },
        { label: 'Defective', value: 'defective' },
        { label: 'Transferred', value: 'transferred' },
      ],
      defaultValue: 'available',
      required: true,
      index: true,
    },
    {
      name: 'supplier',
      type: 'relationship',
      relationTo: 'contacts',
      admin: {
        description: 'Supplier who provided this unit',
      },
    },
    {
      name: 'business_location',
      type: 'relationship',
      relationTo: 'business-locations',
      required: true,
      index: true,
    },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
      index: true,
    },
    {
      name: 'sold_at',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'invoice_id',
      type: 'text',
      admin: {
        description: 'Invoice number if sold',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'created_by',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}
