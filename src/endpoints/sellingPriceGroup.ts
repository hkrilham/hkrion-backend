import { PayloadHandler } from 'payload'

// ==================== VALIDATION HELPERS ====================

const validateGroupName = (name: string | undefined): { valid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Group name is required' }
  }
  if (name.length < 2) {
    return { valid: false, error: 'Group name must be at least 2 characters' }
  }
  if (name.length > 50) {
    return { valid: false, error: 'Group name must not exceed 50 characters' }
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

const validateColor = (color: string | undefined): { valid: boolean; error?: string } => {
  if (color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return { valid: false, error: 'Invalid color format. Use hex format (e.g., #FF5733)' }
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

// ==================== LIST PRICE GROUPS ====================

/**
 * GET /api/selling-price-groups/list
 * Returns all selling price groups for the current user's business
 */
export const listPriceGroups: PayloadHandler = async (req): Promise<Response> => {
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
    const sort = url.searchParams.get('sort') || 'group_name'

    // Build where clause
    const whereClause: any = {
      business: { equals: businessId },
    }

    // Add search filter
    if (search) {
      whereClause.group_name = { contains: search }
    }

    const priceGroups = await payload.find({
      collection: 'selling-price-groups',
      where: whereClause,
      depth: 0,
      overrideAccess: true,
      page,
      limit,
      sort,
    })

    return Response.json({
      success: true,
      data: priceGroups.docs,
      totalDocs: priceGroups.totalDocs,
      totalPages: priceGroups.totalPages,
      page: priceGroups.page,
      limit: priceGroups.limit,
      hasNextPage: priceGroups.hasNextPage,
      hasPrevPage: priceGroups.hasPrevPage,
    })
  } catch (error: any) {
    console.error('List Price Groups Error:', error)
    return Response.json(
      { error: error.message || 'Failed to fetch price groups' },
      { status: 500 },
    )
  }
}

// ==================== GET PRICE GROUP ====================

/**
 * GET /api/selling-price-groups/:id
 * Returns a single price group by ID
 */
export const getPriceGroup: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Price group ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const priceGroup = await payload.findByID({
      collection: 'selling-price-groups',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!priceGroup) {
      return Response.json({ error: 'Price group not found' }, { status: 404 })
    }

    // Check if price group belongs to user's business
    const pgBusiness = priceGroup.business
    if (!pgBusiness) {
      return Response.json({ error: 'Price group not found' }, { status: 404 })
    }
    const pgBusinessId = typeof pgBusiness === 'object' ? pgBusiness.id : pgBusiness
    if (pgBusinessId !== businessId) {
      return Response.json({ error: 'Price group not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: priceGroup,
    })
  } catch (error: any) {
    console.error('Get Price Group Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch price group' }, { status: 500 })
  }
}

// ==================== CREATE PRICE GROUP ====================

/**
 * POST /api/selling-price-groups/create
 * Creates a new price group
 */
export const createPriceGroup: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  // Validate group_name
  const nameValidation = validateGroupName(data.group_name)
  if (!nameValidation.valid) {
    return Response.json({ error: nameValidation.error }, { status: 400 })
  }

  // Validate description
  const descValidation = validateDescription(data.description)
  if (!descValidation.valid) {
    return Response.json({ error: descValidation.error }, { status: 400 })
  }

  // Validate color
  const colorValidation = validateColor(data.color)
  if (!colorValidation.valid) {
    return Response.json({ error: colorValidation.error }, { status: 400 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if group name already exists for this business
    const existingGroup = await payload.find({
      collection: 'selling-price-groups',
      where: {
        business: { equals: businessId },
        group_name: { equals: data.group_name.trim() },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingGroup.totalDocs > 0) {
      return Response.json({ error: 'Price group with this name already exists' }, { status: 409 })
    }

    const priceGroup = await payload.create({
      collection: 'selling-price-groups',
      data: {
        group_name: data.group_name.trim(),
        description: data.description?.trim() || '',
        color: data.color?.trim() || '',
        business: businessId,
      },
      overrideAccess: true,
    })

    return Response.json(
      {
        success: true,
        message: 'Price group created successfully',
        data: stripBusinessDetails(priceGroup),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Create Price Group Error:', error)
    return Response.json(
      { error: error.message || 'Failed to create price group' },
      { status: 500 },
    )
  }
}

// ==================== UPDATE PRICE GROUP ====================

/**
 * PATCH /api/selling-price-groups/:id
 * Updates a price group
 */
export const updatePriceGroup: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Price group ID is required' }, { status: 400 })
  }

  // Validate fields if provided
  if (data.group_name !== undefined) {
    const nameValidation = validateGroupName(data.group_name)
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

  if (data.color !== undefined) {
    const colorValidation = validateColor(data.color)
    if (!colorValidation.valid) {
      return Response.json({ error: colorValidation.error }, { status: 400 })
    }
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if price group exists and belongs to user's business
    const existingGroup = await payload.findByID({
      collection: 'selling-price-groups',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingGroup) {
      return Response.json({ error: 'Price group not found' }, { status: 404 })
    }

    const existingGroupBusiness = existingGroup.business
    if (!existingGroupBusiness) {
      return Response.json({ error: 'Price group not found' }, { status: 404 })
    }
    const pgBusinessId =
      typeof existingGroupBusiness === 'object' ? existingGroupBusiness.id : existingGroupBusiness
    if (pgBusinessId !== businessId) {
      return Response.json({ error: 'Price group not found' }, { status: 404 })
    }

    // Check for duplicate name
    if (data.group_name && data.group_name.trim() !== existingGroup.group_name) {
      const duplicateGroup = await payload.find({
        collection: 'selling-price-groups',
        where: {
          business: { equals: businessId },
          group_name: { equals: data.group_name.trim() },
          id: { not_equals: id },
        },
        limit: 1,
        overrideAccess: true,
      })

      if (duplicateGroup.totalDocs > 0) {
        return Response.json(
          { error: 'Price group with this name already exists' },
          { status: 409 },
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (data.group_name !== undefined) updateData.group_name = data.group_name.trim()
    if (data.description !== undefined) updateData.description = data.description.trim()
    if (data.color !== undefined) updateData.color = data.color.trim()

    const updatedGroup = await payload.update({
      collection: 'selling-price-groups',
      id,
      data: updateData,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Price group updated successfully',
      data: stripBusinessDetails(updatedGroup),
    })
  } catch (error: any) {
    console.error('Update Price Group Error:', error)
    return Response.json(
      { error: error.message || 'Failed to update price group' },
      { status: 500 },
    )
  }
}

// ==================== DELETE PRICE GROUP ====================

/**
 * DELETE /api/selling-price-groups/:id
 * Deletes a price group
 */
export const deletePriceGroup: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Price group ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if price group exists and belongs to user's business
    const existingGroup = await payload.findByID({
      collection: 'selling-price-groups',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingGroup) {
      return Response.json({ error: 'Price group not found' }, { status: 404 })
    }

    const existingGroupBusiness = existingGroup.business
    if (!existingGroupBusiness) {
      return Response.json({ error: 'Price group not found' }, { status: 404 })
    }
    const pgBusinessId =
      typeof existingGroupBusiness === 'object' ? existingGroupBusiness.id : existingGroupBusiness
    if (pgBusinessId !== businessId) {
      return Response.json({ error: 'Price group not found' }, { status: 404 })
    }

    // NOTE: In the future, when selling_price_group is added to product-stock-price,
    // add a check here to prevent deletion if linked to prices

    await payload.delete({
      collection: 'selling-price-groups',
      id,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Price group deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete Price Group Error:', error)
    return Response.json(
      { error: error.message || 'Failed to delete price group' },
      { status: 500 },
    )
  }
}
