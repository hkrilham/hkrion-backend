import type { CollectionConfig } from 'payload'

export const StockTransferItemImeis: CollectionConfig = {
  slug: 'stock-transfer-item-imeis',
  admin: {
    useAsTitle: 'imei_number',
  },
  fields: [
    { name: 'stock_transfer_item', type: 'relationship', relationTo: 'stock-transfer-items' }, // Need StockTransferItems
    { name: 'imei_number', type: 'text' },
    { name: 'type', type: 'text' },
  ],
}
