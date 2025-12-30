import type { CollectionConfig } from 'payload'

export const StockTransferItems: CollectionConfig = {
  slug: 'stock-transfer-items',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    { name: 'transfer', type: 'relationship', relationTo: 'stock-transfers', required: true }, // Need StockTransfers
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'quantity', type: 'number', required: true },
    { name: 'received_quantity', type: 'number', defaultValue: 0 },
    { name: 'imei', type: 'text' },
    { name: 'serial_number', type: 'text' },
    { name: 'quantity_received', type: 'number', defaultValue: 0 },
    { name: 'unit_price', type: 'number', defaultValue: 0 },
    { name: 'subtotal', type: 'number', defaultValue: 0 },
  ],
}
