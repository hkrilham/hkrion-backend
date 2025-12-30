import { PayloadHandler } from 'payload'

// ==================== VALIDATION HELPERS ====================

const DURATION_TYPES = ['days', 'months', 'years']

const validateWarrantyName = (name: string | undefined): { valid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Warranty name is required' }
  }
  if (name.length < 2) {
    return { valid: false, error: 'Warranty name must be at least 2 characters' }
  }
  if (name.length > 100) {
    return { valid: false, error: 'Warranty name must not exceed 100 characters' }
  }
  return { valid: true }
}

const validateDescription = (
  description: string | undefined,
): { valid: boolean; error?: string } => {
  if (description && description.length > 500) {
    return { valid: false, error: 'Description must not exceed 500 characters' }
  }
  return { valid: true }
}

const validateDuration = (duration: number | undefined): { valid: boolean; error?: string } => {
  if (duration === undefined || duration === null) {
    return { valid: false, error: 'Duration is required' }
  }
  if (typeof duration !== 'number' || duration < 0) {
    return { valid: false, error: 'Duration must be a non-negative number' }
  }
  if (!Number.isInteger(duration)) {
    return { valid: false, error: 'Duration must be a whole number' }
  }
  return { valid: true }
}

const validateDurationType = (type: string | undefined): { valid: boolean; error?: string } => {
  if (type && !DURATION_TYPES.includes(type)) {
    return { valid: false, error: `Duration type must be one of: ${DURATION_TYPES.join(', ')}` }
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

// ==================== LIST WARRANTIES ====================

/**
 * GET /api/warranties/list
 * Returns all warranties for the current user's business
 */
export const listWarranties: PayloadHandler = async (req): Promise<Response> => {
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
    const durationType = url.searchParams.get('duration_type')

    // Build where clause
    const whereClause: any = {
      business: { equals: businessId },
    }

    // Add search filter
    if (search) {
      whereClause.name = { contains: search }
    }

    // Filter by duration type
    if (durationType && DURATION_TYPES.includes(durationType)) {
      whereClause.duration_type = { equals: durationType }
    }

    const warranties = await payload.find({
      collection: 'warranties',
      where: whereClause,
      depth: 0,
      overrideAccess: true,
      page,
      limit,
      sort,
    })

    return Response.json({
      success: true,
      data: warranties.docs,
      totalDocs: warranties.totalDocs,
      totalPages: warranties.totalPages,
      page: warranties.page,
      limit: warranties.limit,
      hasNextPage: warranties.hasNextPage,
      hasPrevPage: warranties.hasPrevPage,
    })
  } catch (error: any) {
    console.error('List Warranties Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch warranties' }, { status: 500 })
  }
}

// ==================== GET WARRANTY ====================

/**
 * GET /api/warranties/:id
 * Returns a single warranty by ID
 */
export const getWarranty: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Warranty ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const warranty = await payload.findByID({
      collection: 'warranties',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!warranty) {
      return Response.json({ error: 'Warranty not found' }, { status: 404 })
    }

    // Check if warranty belongs to user's business
    const warrantyBusiness = warranty.business
    if (!warrantyBusiness) {
      return Response.json({ error: 'Warranty not found' }, { status: 404 })
    }
    const warrantyBusinessId =
      typeof warrantyBusiness === 'object' ? warrantyBusiness.id : warrantyBusiness
    if (warrantyBusinessId !== businessId) {
      return Response.json({ error: 'Warranty not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: warranty,
    })
  } catch (error: any) {
    console.error('Get Warranty Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch warranty' }, { status: 500 })
  }
}

// ==================== CREATE WARRANTY ====================

/**
 * POST /api/warranties/create
 * Creates a new warranty
 */
export const createWarranty: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  // Validate name
  const nameValidation = validateWarrantyName(data.name)
  if (!nameValidation.valid) {
    return Response.json({ error: nameValidation.error }, { status: 400 })
  }

  // Validate description
  const descValidation = validateDescription(data.description)
  if (!descValidation.valid) {
    return Response.json({ error: descValidation.error }, { status: 400 })
  }

  // Validate duration
  const durationValidation = validateDuration(data.duration)
  if (!durationValidation.valid) {
    return Response.json({ error: durationValidation.error }, { status: 400 })
  }

  // Validate duration_type
  const typeValidation = validateDurationType(data.duration_type)
  if (!typeValidation.valid) {
    return Response.json({ error: typeValidation.error }, { status: 400 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if warranty name already exists for this business
    const existingWarranty = await payload.find({
      collection: 'warranties',
      where: {
        business: { equals: businessId },
        name: { equals: data.name.trim() },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingWarranty.totalDocs > 0) {
      return Response.json({ error: 'Warranty with this name already exists' }, { status: 409 })
    }

    const warranty = await payload.create({
      collection: 'warranties',
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        duration: data.duration,
        duration_type: data.duration_type || 'months',
        business: businessId,
      },
      overrideAccess: true,
    })

    return Response.json(
      {
        success: true,
        message: 'Warranty created successfully',
        data: stripBusinessDetails(warranty),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Create Warranty Error:', error)
    return Response.json({ error: error.message || 'Failed to create warranty' }, { status: 500 })
  }
}

// ==================== UPDATE WARRANTY ====================

/**
 * PATCH /api/warranties/:id
 * Updates a warranty
 */
export const updateWarranty: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Warranty ID is required' }, { status: 400 })
  }

  // Validate fields if provided
  if (data.name !== undefined) {
    const nameValidation = validateWarrantyName(data.name)
    if (!nameValidation.valid) {
      return Response.json({ error: nameValidation.error }, { status: 400 })
    }
  }

  if (data.description !== undefined) {
    const descValidation = validateDescription(data.description)
    if (!descValidation.valid) {
      return Response.json({ error: descValidation.error }, { status: 400 })
    }
  }

  if (data.duration !== undefined) {
    const durationValidation = validateDuration(data.duration)
    if (!durationValidation.valid) {
      return Response.json({ error: durationValidation.error }, { status: 400 })
    }
  }

  if (data.duration_type !== undefined) {
    const typeValidation = validateDurationType(data.duration_type)
    if (!typeValidation.valid) {
      return Response.json({ error: typeValidation.error }, { status: 400 })
    }
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if warranty exists and belongs to user's business
    const existingWarranty = await payload.findByID({
      collection: 'warranties',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingWarranty) {
      return Response.json({ error: 'Warranty not found' }, { status: 404 })
    }

    const existingWarrantyBusiness = existingWarranty.business
    if (!existingWarrantyBusiness) {
      return Response.json({ error: 'Warranty not found' }, { status: 404 })
    }
    const warrantyBusinessId =
      typeof existingWarrantyBusiness === 'object'
        ? existingWarrantyBusiness.id
        : existingWarrantyBusiness
    if (warrantyBusinessId !== businessId) {
      return Response.json({ error: 'Warranty not found' }, { status: 404 })
    }

    // Check for duplicate name
    if (data.name && data.name.trim() !== existingWarranty.name) {
      const duplicateWarranty = await payload.find({
        collection: 'warranties',
        where: {
          business: { equals: businessId },
          name: { equals: data.name.trim() },
          id: { not_equals: id },
        },
        limit: 1,
        overrideAccess: true,
      })

      if (duplicateWarranty.totalDocs > 0) {
        return Response.json({ error: 'Warranty with this name already exists' }, { status: 409 })
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.description !== undefined) updateData.description = data.description.trim()
    if (data.duration !== undefined) updateData.duration = data.duration
    if (data.duration_type !== undefined) updateData.duration_type = data.duration_type

    const updatedWarranty = await payload.update({
      collection: 'warranties',
      id,
      data: updateData,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Warranty updated successfully',
      data: stripBusinessDetails(updatedWarranty),
    })
  } catch (error: any) {
    console.error('Update Warranty Error:', error)
    return Response.json({ error: error.message || 'Failed to update warranty' }, { status: 500 })
  }
}

// ==================== DELETE WARRANTY ====================

/**
 * DELETE /api/warranties/:id
 * Deletes a warranty
 */
export const deleteWarranty: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Warranty ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if warranty exists and belongs to user's business
    const existingWarranty = await payload.findByID({
      collection: 'warranties',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingWarranty) {
      return Response.json({ error: 'Warranty not found' }, { status: 404 })
    }

    const existingWarrantyBusiness = existingWarranty.business
    if (!existingWarrantyBusiness) {
      return Response.json({ error: 'Warranty not found' }, { status: 404 })
    }
    const warrantyBusinessId =
      typeof existingWarrantyBusiness === 'object'
        ? existingWarrantyBusiness.id
        : existingWarrantyBusiness
    if (warrantyBusinessId !== businessId) {
      return Response.json({ error: 'Warranty not found' }, { status: 404 })
    }

    // Check if warranty is linked to any products
    const linkedProducts = await payload.find({
      collection: 'products',
      where: {
        warranty: { equals: id },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (linkedProducts.totalDocs > 0) {
      return Response.json(
        {
          error: `Cannot delete warranty, it is linked to ${linkedProducts.totalDocs} product(s)`,
        },
        { status: 409 },
      )
    }

    await payload.delete({
      collection: 'warranties',
      id,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Warranty deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete Warranty Error:', error)
    return Response.json({ error: error.message || 'Failed to delete warranty' }, { status: 500 })
  }
}
