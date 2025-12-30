import { PayloadHandler } from 'payload'

// Helper to strip full business details from response
const stripBusinessDetails = (doc: any): any => {
  if (!doc) return doc
  const { business, from_unit, to_unit, ...rest } = doc
  return {
    ...rest,
    business: typeof business === 'object' ? business?.id : business,
    from_unit: from_unit
      ? typeof from_unit === 'object'
        ? { id: from_unit.id, name: from_unit.name, short_name: from_unit.short_name }
        : from_unit
      : null,
    to_unit: to_unit
      ? typeof to_unit === 'object'
        ? { id: to_unit.id, name: to_unit.name, short_name: to_unit.short_name }
        : to_unit
      : null,
  }
}

// ==================== LIST CONVERSIONS ====================

/**
 * GET /api/unit_conversions/list
 * Returns all unit conversions for the current user's business
 */
export const listConversions: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const conversions = await payload.find({
      collection: 'unit_conversions',
      where: {
        business: { equals: businessId },
      },
      depth: 1, // Include unit details
      overrideAccess: true,
      limit: 500,
    })

    return Response.json({
      success: true,
      data: conversions.docs.map(stripBusinessDetails),
      totalDocs: conversions.totalDocs,
    })
  } catch (error: any) {
    console.error('List Conversions Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch conversions' }, { status: 500 })
  }
}

// ==================== CREATE CONVERSION ====================

/**
 * POST /api/unit_conversions/create
 * Creates a new unit conversion
 */
export const createConversion: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  // Validate required fields
  if (!data.from_unit) {
    return Response.json({ error: 'from_unit is required' }, { status: 400 })
  }
  if (!data.to_unit) {
    return Response.json({ error: 'to_unit is required' }, { status: 400 })
  }
  if (data.factor === undefined || data.factor === null) {
    return Response.json({ error: 'factor is required' }, { status: 400 })
  }
  if (typeof data.factor !== 'number' || data.factor <= 0) {
    return Response.json({ error: 'factor must be a positive number' }, { status: 400 })
  }
  if (data.from_unit === data.to_unit) {
    return Response.json({ error: 'from_unit and to_unit cannot be the same' }, { status: 400 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Verify both units exist and belong to business
    const fromUnit = await payload.findByID({
      collection: 'units',
      id: data.from_unit,
      depth: 0,
      overrideAccess: true,
    })
    if (!fromUnit) {
      return Response.json({ error: 'from_unit not found' }, { status: 400 })
    }
    const fromUnitBusiness =
      typeof fromUnit.business === 'object' ? fromUnit.business?.id : fromUnit.business
    if (fromUnitBusiness !== businessId) {
      return Response.json({ error: 'from_unit does not belong to your business' }, { status: 400 })
    }

    const toUnit = await payload.findByID({
      collection: 'units',
      id: data.to_unit,
      depth: 0,
      overrideAccess: true,
    })
    if (!toUnit) {
      return Response.json({ error: 'to_unit not found' }, { status: 400 })
    }
    const toUnitBusiness =
      typeof toUnit.business === 'object' ? toUnit.business?.id : toUnit.business
    if (toUnitBusiness !== businessId) {
      return Response.json({ error: 'to_unit does not belong to your business' }, { status: 400 })
    }

    // Check if conversion already exists
    const existingConversion = await payload.find({
      collection: 'unit_conversions',
      where: {
        business: { equals: businessId },
        from_unit: { equals: data.from_unit },
        to_unit: { equals: data.to_unit },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingConversion.totalDocs > 0) {
      return Response.json(
        { error: 'Conversion between these units already exists' },
        { status: 409 },
      )
    }

    // Create conversion
    const conversion = await payload.create({
      collection: 'unit_conversions',
      data: {
        from_unit: data.from_unit,
        to_unit: data.to_unit,
        factor: data.factor,
        business: businessId,
      },
      overrideAccess: true,
    })

    // Also create reverse conversion automatically
    await payload.create({
      collection: 'unit_conversions',
      data: {
        from_unit: data.to_unit,
        to_unit: data.from_unit,
        factor: 1 / data.factor,
        business: businessId,
      },
      overrideAccess: true,
    })

    return Response.json(
      {
        success: true,
        message: 'Conversion created successfully (reverse conversion also created)',
        data: stripBusinessDetails(conversion),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Create Conversion Error:', error)
    return Response.json({ error: error.message || 'Failed to create conversion' }, { status: 500 })
  }
}

// ==================== DELETE CONVERSION ====================

/**
 * DELETE /api/unit_conversions/:id
 * Deletes a unit conversion
 */
export const deleteConversion: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Conversion ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const existingConversion = await payload.findByID({
      collection: 'unit_conversions',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingConversion) {
      return Response.json({ error: 'Conversion not found' }, { status: 404 })
    }

    const conversionBusiness = existingConversion.business
    const conversionBusinessId =
      typeof conversionBusiness === 'object' ? conversionBusiness?.id : conversionBusiness
    if (conversionBusinessId !== businessId) {
      return Response.json({ error: 'Conversion not found' }, { status: 404 })
    }

    await payload.delete({
      collection: 'unit_conversions',
      id,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Conversion deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete Conversion Error:', error)
    return Response.json({ error: error.message || 'Failed to delete conversion' }, { status: 500 })
  }
}

// ==================== CONVERT UNITS ====================

/**
 * POST /api/unit_conversions/convert
 * Convert a value from one unit to another
 */
export const convertUnits: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  // Validate required fields
  if (data.value === undefined || data.value === null) {
    return Response.json({ error: 'value is required' }, { status: 400 })
  }
  if (!data.from_unit) {
    return Response.json(
      { error: 'from_unit is required (unit ID or short_name)' },
      { status: 400 },
    )
  }
  if (!data.to_unit) {
    return Response.json({ error: 'to_unit is required (unit ID or short_name)' }, { status: 400 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Find from_unit (by ID or short_name)
    let fromUnit: any
    const fromUnitSearch = await payload.find({
      collection: 'units',
      where: {
        business: { equals: businessId },
        or: [{ id: { equals: data.from_unit } }, { short_name: { equals: data.from_unit } }],
      },
      limit: 1,
      overrideAccess: true,
    })
    if (fromUnitSearch.totalDocs === 0) {
      return Response.json({ error: `from_unit "${data.from_unit}" not found` }, { status: 400 })
    }
    fromUnit = fromUnitSearch.docs[0]

    // Find to_unit (by ID or short_name)
    let toUnit: any
    const toUnitSearch = await payload.find({
      collection: 'units',
      where: {
        business: { equals: businessId },
        or: [{ id: { equals: data.to_unit } }, { short_name: { equals: data.to_unit } }],
      },
      limit: 1,
      overrideAccess: true,
    })
    if (toUnitSearch.totalDocs === 0) {
      return Response.json({ error: `to_unit "${data.to_unit}" not found` }, { status: 400 })
    }
    toUnit = toUnitSearch.docs[0]

    // Same unit - return same value
    if (fromUnit.id === toUnit.id) {
      return Response.json({
        success: true,
        data: {
          original_value: data.value,
          original_unit: fromUnit.short_name,
          converted_value: data.value,
          converted_unit: toUnit.short_name,
        },
      })
    }

    // Find conversion factor
    const conversion = await payload.find({
      collection: 'unit_conversions',
      where: {
        business: { equals: businessId },
        from_unit: { equals: fromUnit.id },
        to_unit: { equals: toUnit.id },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (conversion.totalDocs === 0) {
      return Response.json(
        {
          error: `No conversion defined from "${fromUnit.short_name}" to "${toUnit.short_name}"`,
        },
        { status: 400 },
      )
    }

    const factor = conversion.docs[0].factor
    const convertedValue = data.value * (factor as number)

    return Response.json({
      success: true,
      data: {
        original_value: data.value,
        original_unit: fromUnit.short_name,
        original_unit_name: fromUnit.name,
        converted_value: convertedValue,
        converted_unit: toUnit.short_name,
        converted_unit_name: toUnit.name,
        factor: factor,
      },
    })
  } catch (error: any) {
    console.error('Convert Units Error:', error)
    return Response.json({ error: error.message || 'Failed to convert units' }, { status: 500 })
  }
}

// ==================== GET UNITS BY GROUP ====================

/**
 * GET /api/units/by-group/:group
 * Get all units in a specific group
 */
export const getUnitsByGroup: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const group = routeParams?.group as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  if (!group) {
    return Response.json({ error: 'Group is required' }, { status: 400 })
  }

  const validGroups = ['MASS', 'LENGTH', 'VOLUME', 'AREA', 'COUNT', 'TIME', 'OTHER']
  if (!validGroups.includes(group.toUpperCase())) {
    return Response.json(
      { error: `Invalid group. Valid groups: ${validGroups.join(', ')}` },
      { status: 400 },
    )
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const units = await payload.find({
      collection: 'units',
      where: {
        business: { equals: businessId },
        unit_group: { equals: group.toUpperCase() },
      },
      depth: 0,
      overrideAccess: true,
      limit: 100,
    })

    return Response.json({
      success: true,
      group: group.toUpperCase(),
      data: units.docs,
      totalDocs: units.totalDocs,
    })
  } catch (error: any) {
    console.error('Get Units By Group Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch units' }, { status: 500 })
  }
}

// ==================== GET UNIT GROUPS ====================

/**
 * GET /api/units/groups
 * Get all available unit groups
 */
export const getUnitGroups: PayloadHandler = async (req): Promise<Response> => {
  const { user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return Response.json({
    success: true,
    data: [
      { value: 'MASS', label: 'Mass (Weight)', examples: 'kg, g, mg, tonne' },
      { value: 'LENGTH', label: 'Length', examples: 'm, cm, mm, km' },
      { value: 'VOLUME', label: 'Volume', examples: 'L, mL, gallon' },
      { value: 'AREA', label: 'Area', examples: 'm², cm², ft²' },
      { value: 'COUNT', label: 'Count/Quantity', examples: 'pcs, dozen, box' },
      { value: 'TIME', label: 'Time', examples: 'hour, minute, day' },
      { value: 'OTHER', label: 'Other', examples: 'custom units' },
    ],
  })
}
