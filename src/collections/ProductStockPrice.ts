import type { CollectionConfig } from 'payload'
import { disableRestApiAccess } from '../hooks/disableRestApiAccess'
import { listStocks, addOpeningStock, updateStockPrice, deleteStock } from '../endpoints/stock'

export const ProductStockPrice: CollectionConfig = {
  slug: 'product-stock-price',
  admin: {
    useAsTitle: 'lot_number',
    group: 'Inventory',
    defaultColumns: ['product', 'lot_number', 'stock', 'business_location'],
  },
  endpoints: [
    { path: '/list', method: 'get', handler: listStocks },
    { path: '/opening', method: 'post', handler: addOpeningStock },
    { path: '/:id/price', method: 'patch', handler: updateStockPrice },
    { path: '/:id', method: 'delete', handler: deleteStock },
  ],
  access: {
    read: disableRestApiAccess,
    update: disableRestApiAccess,
    delete: disableRestApiAccess,
    create: disableRestApiAccess,
  },
  fields: [
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
      index: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
    },
    {
      name: 'supplier',
      type: 'relationship',
      relationTo: 'contacts', // Ensure 'contacts' collection exists or update relationTo
    },
    {
      name: 'business_location',
      type: 'relationship',
      relationTo: 'business-locations',
      required: true,
      index: true,
    },
    {
      name: 'lot_number',
      type: 'text',
      unique: false, // Lot numbers can repeat if manually entered across products, but usually unique per product/batch
      index: true,
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Current quantity available',
      },
    },
    {
      name: 'alert_quantity',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'unit_price',
      type: 'number', // Cost Price (Purchase Price)
      defaultValue: 0,
      label: 'Purchase Price (Unit Cost)',
    },
    {
      name: 'default_selling_price',
      type: 'number', // Base Selling Price
      defaultValue: 0,
      label: 'Selling Price (Default)',
    },
    {
      name: 'group_prices',
      type: 'json', // Store flexible group prices
      admin: {
        description: 'Store different prices for price groups e.g., Wholesale, Retail',
      },
    },
    {
      name: 'sold',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Expired', value: 'expired' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'manufacturing_date',
      type: 'date',
    },
    {
      name: 'expiry_date',
      type: 'date',
    },
    {
      name: 'note',
      type: 'textarea',
    },
    {
      name: 'created_by',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}
