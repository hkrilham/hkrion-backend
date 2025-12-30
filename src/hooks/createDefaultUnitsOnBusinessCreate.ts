import type { CollectionAfterChangeHook } from 'payload'

/**
 * Creates default units and conversions when a new business is created
 */
export const createDefaultUnitsOnBusinessCreate: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  // Only run on create operation
  if (operation !== 'create') {
    return doc
  }

  const { payload } = req
  const businessId = doc.id

  console.log(`Creating default units for business: ${businessId}`)

  try {
    // Type for unit group
    type UnitGroup = 'MASS' | 'LENGTH' | 'VOLUME' | 'AREA' | 'COUNT' | 'TIME' | 'OTHER'

    // Default units to create
    const defaultUnits: {
      name: string
      short_name: string
      unit_group: UnitGroup
      is_base_unit: boolean
      allow_decimal: boolean
    }[] = [
      // COUNT units
      {
        name: 'Pieces',
        short_name: 'pcs',
        unit_group: 'COUNT',
        is_base_unit: true,
        allow_decimal: false,
      },
      {
        name: 'Box',
        short_name: 'box',
        unit_group: 'COUNT',
        is_base_unit: false,
        allow_decimal: false,
      },
      {
        name: 'Dozen',
        short_name: 'dz',
        unit_group: 'COUNT',
        is_base_unit: false,
        allow_decimal: false,
      },
      {
        name: 'Pack',
        short_name: 'pack',
        unit_group: 'COUNT',
        is_base_unit: false,
        allow_decimal: false,
      },

      // MASS units
      {
        name: 'Kilogram',
        short_name: 'kg',
        unit_group: 'MASS',
        is_base_unit: true,
        allow_decimal: true,
      },
      {
        name: 'Gram',
        short_name: 'g',
        unit_group: 'MASS',
        is_base_unit: false,
        allow_decimal: false,
      },
      {
        name: 'Milligram',
        short_name: 'mg',
        unit_group: 'MASS',
        is_base_unit: false,
        allow_decimal: false,
      },

      // VOLUME units
      {
        name: 'Liter',
        short_name: 'L',
        unit_group: 'VOLUME',
        is_base_unit: true,
        allow_decimal: true,
      },
      {
        name: 'Milliliter',
        short_name: 'mL',
        unit_group: 'VOLUME',
        is_base_unit: false,
        allow_decimal: false,
      },

      // LENGTH units
      {
        name: 'Meter',
        short_name: 'm',
        unit_group: 'LENGTH',
        is_base_unit: true,
        allow_decimal: true,
      },
      {
        name: 'Centimeter',
        short_name: 'cm',
        unit_group: 'LENGTH',
        is_base_unit: false,
        allow_decimal: false,
      },
      {
        name: 'Millimeter',
        short_name: 'mm',
        unit_group: 'LENGTH',
        is_base_unit: false,
        allow_decimal: false,
      },
    ]

    // Create all units
    const createdUnits: Record<string, number> = {}

    for (const unitData of defaultUnits) {
      const unit = await payload.create({
        collection: 'units',
        data: {
          ...unitData,
          business: businessId,
        },
        overrideAccess: true,
      })
      createdUnits[unitData.short_name] = unit.id as number
    }

    console.log(`Created ${Object.keys(createdUnits).length} default units`)

    // Default conversions to create
    const defaultConversions = [
      // MASS conversions
      { from: 'kg', to: 'g', factor: 1000 },
      { from: 'g', to: 'kg', factor: 0.001 },
      { from: 'kg', to: 'mg', factor: 1000000 },
      { from: 'mg', to: 'kg', factor: 0.000001 },
      { from: 'g', to: 'mg', factor: 1000 },
      { from: 'mg', to: 'g', factor: 0.001 },

      // VOLUME conversions
      { from: 'L', to: 'mL', factor: 1000 },
      { from: 'mL', to: 'L', factor: 0.001 },

      // LENGTH conversions
      { from: 'm', to: 'cm', factor: 100 },
      { from: 'cm', to: 'm', factor: 0.01 },
      { from: 'm', to: 'mm', factor: 1000 },
      { from: 'mm', to: 'm', factor: 0.001 },
      { from: 'cm', to: 'mm', factor: 10 },
      { from: 'mm', to: 'cm', factor: 0.1 },

      // COUNT conversions
      { from: 'dz', to: 'pcs', factor: 12 },
      { from: 'pcs', to: 'dz', factor: 1 / 12 },
    ]

    // Create all conversions
    let conversionCount = 0
    for (const conv of defaultConversions) {
      const fromUnitId = createdUnits[conv.from]
      const toUnitId = createdUnits[conv.to]

      if (fromUnitId && toUnitId) {
        await payload.create({
          collection: 'unit_conversions',
          data: {
            from_unit: fromUnitId,
            to_unit: toUnitId,
            factor: conv.factor,
            business: businessId,
          },
          overrideAccess: true,
        })
        conversionCount++
      }
    }

    console.log(`Created ${conversionCount} default unit conversions`)
    console.log(`Default units setup complete for business: ${businessId}`)
  } catch (error) {
    console.error('Error creating default units:', error)
    // Don't throw - we don't want to fail the business creation
  }

  return doc
}
