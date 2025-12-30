import { PayloadHandler } from 'payload'

// Type for unit group
type UnitGroup = 'MASS' | 'LENGTH' | 'VOLUME' | 'AREA' | 'COUNT' | 'TIME' | 'OTHER'

/**
 * POST /api/units/seed-defaults
 * Creates default units for the current user's business
 * (for businesses created before the auto-seed hook was added)
 */
export const seedDefaultUnits: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  const businessId = typeof user.business === 'object' ? user.business.id : user.business

  try {
    // Check if units already exist for this business
    const existingUnits = await payload.find({
      collection: 'units',
      where: { business: { equals: businessId } },
      limit: 1,
      overrideAccess: true,
    })

    if (existingUnits.totalDocs > 0) {
      return Response.json(
        { error: 'Units already exist for this business. Use the Units API to manage them.' },
        { status: 409 },
      )
    }

    console.log(`Seeding default units for business: ${businessId}`)

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

    return Response.json({
      success: true,
      message: 'Default units and conversions created successfully',
      data: {
        unitsCreated: Object.keys(createdUnits).length,
        conversionsCreated: conversionCount,
        units: Object.keys(createdUnits),
      },
    })
  } catch (error: any) {
    console.error('Seed Default Units Error:', error)
    return Response.json(
      { error: error.message || 'Failed to seed default units' },
      { status: 500 },
    )
  }
}
