import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'

export const CustomerBalanceDetails: CollectionConfig = {
  slug: 'customer-balance-details',
  admin: {
    useAsTitle: 'first_name',
  },
  access: {
    read: filterByBusiness,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    // We map the view's data. Payload expects an 'id' by default.
    // If the view doesn't return 'id', this might be tricky without a custom adapter config.
    // However, defining fields allows us to see data if Payload can fetch it.
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'contacts',
      // The view column is 'customer_id'
      index: true,
    },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
    },
    {
      name: 'contact_id',
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
      name: 'mobile',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'total_due_amount',
      type: 'number',
    },
    {
      name: 'credit_sales_count',
      type: 'number',
    },
    {
      name: 'oldest_due_date',
      type: 'date',
    },
    {
      name: 'latest_due_date',
      type: 'date',
    },
    {
      name: 'calculated_due_amount',
      type: 'number',
    },
  ],
}
