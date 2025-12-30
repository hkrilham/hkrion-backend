import type { CollectionConfig } from 'payload'
import { filterByBusiness } from '../hooks/filterByBusiness'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'

export const UserProfiles: CollectionConfig = {
  slug: 'user-profiles',
  admin: {
    useAsTitle: 'username',
  },
  access: {
    read: filterByBusiness,
    update: filterByBusiness,
    delete: filterByBusiness,
    create: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [setBusinessOnCreate],
  },
  fields: [
    // Basic Info
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
    },
    {
      name: 'username',
      type: 'text',
      required: true,
      unique: true,
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
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'password',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'Cashier', value: 'cashier' },
        { label: 'Staff', value: 'staff' },
      ],
    },
    {
      name: 'role_id',
      type: 'relationship',
      relationTo: 'user-roles',
    },

    // Status & Permissions
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'allow_login',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'enable_service_staff_pin',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'allow_selected_contacts',
      type: 'checkbox',
      defaultValue: false,
    },

    // Sales Settings
    {
      name: 'sales_commission_percentage',
      type: 'number',
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'max_sales_discount_percent',
      type: 'number',
      admin: {
        step: 0.01,
      },
    },

    // Personal Info
    {
      name: 'date_of_birth',
      type: 'date',
    },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' },
      ],
    },
    {
      name: 'marital_status',
      type: 'select',
      options: [
        { label: 'Single', value: 'Single' },
        { label: 'Married', value: 'Married' },
        { label: 'Divorced', value: 'Divorced' },
        { label: 'Widowed', value: 'Widowed' },
      ],
    },
    {
      name: 'blood_group',
      type: 'text',
    },

    // Contact Info
    {
      name: 'mobile_number',
      type: 'text',
    },
    {
      name: 'alternate_contact_number',
      type: 'text',
    },
    {
      name: 'family_contact_number',
      type: 'text',
    },

    // Social Media
    {
      name: 'facebook_link',
      type: 'text',
    },
    {
      name: 'twitter_link',
      type: 'text',
    },
    {
      name: 'social_media_1',
      type: 'text',
    },
    {
      name: 'social_media_2',
      type: 'text',
    },

    // Custom Fields
    {
      name: 'custom_field_1',
      type: 'text',
    },
    {
      name: 'custom_field_2',
      type: 'text',
    },
    {
      name: 'custom_field_3',
      type: 'text',
    },
    {
      name: 'custom_field_4',
      type: 'text',
    },

    // ID Proof
    {
      name: 'id_proof_name',
      type: 'text',
    },
    {
      name: 'id_proof_number',
      type: 'text',
    },

    // Address
    {
      name: 'guardian_name',
      type: 'text',
    },
    {
      name: 'permanent_address',
      type: 'textarea',
    },
    {
      name: 'current_address',
      type: 'textarea',
    },

    // Bank Details
    {
      name: 'account_holder_name',
      type: 'text',
    },
    {
      name: 'account_number',
      type: 'text',
    },
    {
      name: 'bank_name',
      type: 'text',
    },
    {
      name: 'bank_identifier_code',
      type: 'text',
    },
    {
      name: 'branch',
      type: 'text',
    },
    {
      name: 'tax_payer_id',
      type: 'text',
    },

    // Access Locations (array of business location IDs)
    {
      name: 'access_locations',
      type: 'relationship',
      relationTo: 'business-locations',
      hasMany: true,
    },

    // Audit Fields
    {
      name: 'created_by',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'updated_by',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}
