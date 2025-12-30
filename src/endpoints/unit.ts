import { PayloadHandler } from 'payload'

// ==================== VALIDATION HELPERS ====================

const validateUnitName = (name: string | undefined): { valid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Unit name is required' }
  }
  if (name.length < 2) {
    return { valid: false, error: 'Unit name must be at least 2 characters' }
  }
  if (name.length > 50) {
    return { valid: false, error: 'Unit name must not exceed 50 characters' }
  }
  return { valid: true }
}

const validateShortName = (shortName: string | undefined): { valid: boolean; error?: string } => {
  if (!shortName || shortName.trim() === '') {
    return { valid: false, error: 'Short name is required' }
  }
  if (shortName.length > 10) {
    return { valid: false, error: 'Short name must not exceed 10 characters' }
  }
  return { valid: true }
}

// Helper to strip full business details from response
const stripBusinessDetails = (doc: any): any => {
  if (!doc) return doc
  const { business, ...rest } = doc
  return {
    ...rest,
    business: typeof business === 'object' ? business?.id : business,
  }
}

// ==================== LIST UNITS ====================

/**
 * GET /api/units/list
 * Returns all units for the current user's business
 */
export const listUnits: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Parse query params
    const url = new URL(req.url || '', 'http://localhost')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100)
    const search = url.searchParams.get('search') || ''
    const sort = url.searchParams.get('sort') || 'name'

    // Build where clause
    const whereClause: any = {
      business: { equals: businessId },
    }

    // Add search filter
    if (search) {
      whereClause.or = [{ name: { contains: search } }, { short_name: { contains: search } }]
    }

    const units = await payload.find({
      collection: 'units',
      where: whereClause,
      depth: 0,
      overrideAccess: true,
      page,
      limit,
      sort,
    })

    return Response.json({
      success: true,
      data: units.docs,
      totalDocs: units.totalDocs,
      totalPages: units.totalPages,
      page: units.page,
      limit: units.limit,
      hasNextPage: units.hasNextPage,
      hasPrevPage: units.hasPrevPage,
    })
  } catch (error: any) {
    console.error('List Units Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch units' }, { status: 500 })
  }
}

// ==================== GET UNIT ====================

/**
 * GET /api/units/:id
 * Returns a single unit by ID
 */
export const getUnit: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Unit ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const unit = await payload.findByID({
      collection: 'units',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!unit) {
      return Response.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Check if unit belongs to user's business
    const unitBusiness = unit.business
    if (!unitBusiness) {
      return Response.json({ error: 'Unit not found' }, { status: 404 })
    }
    const unitBusinessId = typeof unitBusiness === 'object' ? unitBusiness.id : unitBusiness
    if (unitBusinessId !== businessId) {
      return Response.json({ error: 'Unit not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: unit,
    })
  } catch (error: any) {
    console.error('Get Unit Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch unit' }, { status: 500 })
  }
}

// ==================== CREATE UNIT ====================

/**
 * POST /api/units/create
 * Creates a new unit
 */
export const createUnit: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  // Validate name
  const nameValidation = validateUnitName(data.name)
  if (!nameValidation.valid) {
    return Response.json({ error: nameValidation.error }, { status: 400 })
  }

  // Validate short_name
  const shortNameValidation = validateShortName(data.short_name)
  if (!shortNameValidation.valid) {
    return Response.json({ error: shortNameValidation.error }, { status: 400 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if unit name already exists for this business
    const existingUnit = await payload.find({
      collection: 'units',
      where: {
        business: { equals: businessId },
        or: [
          { name: { equals: data.name.trim() } },
          { short_name: { equals: data.short_name.trim() } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingUnit.totalDocs > 0) {
      return Response.json(
        { error: 'Unit with this name or short name already exists' },
        { status: 409 },
      )
    }

    const unit = await payload.create({
      collection: 'units',
      data: {
        name: data.name.trim(),
        short_name: data.short_name.trim(),
        unit_group: data.unit_group || 'COUNT',
        is_base_unit: data.is_base_unit || false,
        allow_decimal: data.allow_decimal || false,
        business: businessId,
      },
      overrideAccess: true,
    })

    return Response.json(
      {
        success: true,
        message: 'Unit created successfully',
        data: stripBusinessDetails(unit),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Create Unit Error:', error)
    return Response.json({ error: error.message || 'Failed to create unit' }, { status: 500 })
  }
}

// ==================== UPDATE UNIT ====================

/**
 * PATCH /api/units/:id
 * Updates a unit
 */
export const updateUnit: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Unit ID is required' }, { status: 400 })
  }

  // Validate fields if provided
  if (data.name !== undefined) {
    const nameValidation = validateUnitName(data.name)
    if (!nameValidation.valid) {
      return Response.json({ error: nameValidation.error }, { status: 400 })
    }
  }

  if (data.short_name !== undefined) {
    const shortNameValidation = validateShortName(data.short_name)
    if (!shortNameValidation.valid) {
      return Response.json({ error: shortNameValidation.error }, { status: 400 })
    }
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if unit exists and belongs to user's business
    const existingUnit = await payload.findByID({
      collection: 'units',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingUnit) {
      return Response.json({ error: 'Unit not found' }, { status: 404 })
    }

    const existingUnitBusiness = existingUnit.business
    if (!existingUnitBusiness) {
      return Response.json({ error: 'Unit not found' }, { status: 404 })
    }
    const unitBusinessId =
      typeof existingUnitBusiness === 'object' ? existingUnitBusiness.id : existingUnitBusiness
    if (unitBusinessId !== businessId) {
      return Response.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Check for duplicate name or short_name
    if (data.name || data.short_name) {
      const orConditions: any[] = []
      if (data.name && data.name.trim() !== existingUnit.name) {
        orConditions.push({ name: { equals: data.name.trim() } })
      }
      if (data.short_name && data.short_name.trim() !== existingUnit.short_name) {
        orConditions.push({ short_name: { equals: data.short_name.trim() } })
      }

      if (orConditions.length > 0) {
        const duplicateUnit = await payload.find({
          collection: 'units',
          where: {
            business: { equals: businessId },
            id: { not_equals: id },
            or: orConditions,
          },
          limit: 1,
          overrideAccess: true,
        })

        if (duplicateUnit.totalDocs > 0) {
          return Response.json(
            { error: 'Unit with this name or short name already exists' },
            { status: 409 },
          )
        }
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.short_name !== undefined) updateData.short_name = data.short_name.trim()
    if (data.unit_group !== undefined) updateData.unit_group = data.unit_group
    if (data.is_base_unit !== undefined) updateData.is_base_unit = data.is_base_unit
    if (data.allow_decimal !== undefined) updateData.allow_decimal = data.allow_decimal

    const updatedUnit = await payload.update({
      collection: 'units',
      id,
      data: updateData,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Unit updated successfully',
      data: stripBusinessDetails(updatedUnit),
    })
  } catch (error: any) {
    console.error('Update Unit Error:', error)
    return Response.json({ error: error.message || 'Failed to update unit' }, { status: 500 })
  }
}

// ==================== DELETE UNIT ====================

/**
 * DELETE /api/units/:id
 * Deletes a unit
 */
export const deleteUnit: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Unit ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if unit exists and belongs to user's business
    const existingUnit = await payload.findByID({
      collection: 'units',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingUnit) {
      return Response.json({ error: 'Unit not found' }, { status: 404 })
    }

    const existingUnitBusiness = existingUnit.business
    if (!existingUnitBusiness) {
      return Response.json({ error: 'Unit not found' }, { status: 404 })
    }
    const unitBusinessId =
      typeof existingUnitBusiness === 'object' ? existingUnitBusiness.id : existingUnitBusiness
    if (unitBusinessId !== businessId) {
      return Response.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Check if unit is linked to any products
    const linkedProducts = await payload.find({
      collection: 'products',
      where: {
        unit: { equals: id },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (linkedProducts.totalDocs > 0) {
      return Response.json(
        {
          error: `Cannot delete unit, it is linked to ${linkedProducts.totalDocs} product(s)`,
        },
        { status: 409 },
      )
    }

    await payload.delete({
      collection: 'units',
      id,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Unit deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete Unit Error:', error)
    return Response.json({ error: error.message || 'Failed to delete unit' }, { status: 500 })
  }
}
