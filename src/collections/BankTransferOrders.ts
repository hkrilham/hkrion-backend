import type { CollectionConfig } from 'payload'

export const BankTransferOrders: CollectionConfig = {
  slug: 'bank-transfer-orders',
  admin: {
    useAsTitle: 'order_number',
  },
  fields: [
    { name: 'order_number', type: 'text', required: true },
    { name: 'business', type: 'relationship', relationTo: 'businesses' },
    { name: 'package', type: 'relationship', relationTo: 'subscription-packages' }, // Need to create SubscriptionPackages later
    { name: 'bank_account', type: 'relationship', relationTo: 'bank-accounts' },
    { name: 'original_amount', type: 'number', required: true },
    { name: 'discount_amount', type: 'number', defaultValue: 0 },
    { name: 'final_amount', type: 'number', required: true },
    { name: 'currency', type: 'text', defaultValue: 'INR' },
    { name: 'status', type: 'text', defaultValue: 'pending' },
    { name: 'proof_url', type: 'text' },
    { name: 'proof_uploaded_at', type: 'date' },
    { name: 'transaction_reference', type: 'text' },
    { name: 'user_notes', type: 'textarea' },
    { name: 'admin_notes', type: 'textarea' },
    { name: 'verified_by', type: 'relationship', relationTo: 'users' },
    { name: 'verified_at', type: 'date' },
    { name: 'rejected_reason', type: 'textarea' },
    { name: 'subscription_id', type: 'text' }, // or relation to business_subscriptions
    { name: 'expires_at', type: 'date' },
    { name: 'coupon', type: 'relationship', relationTo: 'coupons' }, // Need Coupons
    { name: 'coupon_code', type: 'text' },
    { name: 'subtotal_amount', type: 'number' },
  ],
}
