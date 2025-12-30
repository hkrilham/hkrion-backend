import type { CollectionConfig } from 'payload'

export const BankAccounts: CollectionConfig = {
  slug: 'bank-accounts',
  admin: {
    useAsTitle: 'account_name',
  },
  fields: [
    { name: 'account_name', type: 'text', required: true },
    { name: 'account_number', type: 'text', required: true },
    { name: 'bank_name', type: 'text', required: true },
    { name: 'ifsc_code', type: 'text' },
    { name: 'branch_name', type: 'text' },
    { name: 'upi_id', type: 'text' },
    { name: 'qr_code_url', type: 'text' },
    { name: 'is_primary', type: 'checkbox', defaultValue: false },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
  ],
}
