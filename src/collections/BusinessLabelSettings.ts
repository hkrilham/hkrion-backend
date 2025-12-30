import type { CollectionConfig } from 'payload'

export const BusinessLabelSettings: CollectionConfig = {
  slug: 'business-label-settings',
  admin: {
    useAsTitle: 'default_label_format',
  },
  fields: [
    { name: 'business', type: 'relationship', relationTo: 'businesses', required: true },
    { name: 'default_label_format', type: 'text', defaultValue: 'Standard' },
    { name: 'default_labels_per_row', type: 'number', defaultValue: 3 },
    { name: 'default_barcode_type', type: 'text', defaultValue: 'CODE128' },
    { name: 'default_barcode_size', type: 'text', defaultValue: 'Medium' },
    { name: 'show_product_name', type: 'checkbox', defaultValue: true },
    { name: 'show_sku', type: 'checkbox', defaultValue: true },
    { name: 'show_price', type: 'checkbox', defaultValue: true },
    { name: 'show_barcode', type: 'checkbox', defaultValue: true },
    { name: 'show_business_name', type: 'checkbox', defaultValue: false },
    { name: 'show_business_logo', type: 'checkbox', defaultValue: false },
    { name: 'custom_label_width', type: 'number' },
    { name: 'custom_label_height', type: 'number' },
    { name: 'currency_symbol', type: 'text', defaultValue: '₹' },
    { name: 'currency_position', type: 'text', defaultValue: 'before' },
    { name: 'price_decimal_places', type: 'number', defaultValue: 2 },
    { name: 'default_printer_type', type: 'text', defaultValue: 'pdf' },
    { name: 'default_printer_name', type: 'text' },
    { name: 'default_printer_port', type: 'text' },
    { name: 'print_speed', type: 'number', defaultValue: 5 },
    { name: 'print_density', type: 'number', defaultValue: 10 },
  ],
}
