import { PayloadHandler } from 'payload'

// ==================== VALIDATION HELPERS ====================

const isValidUrl = (url: string): boolean => {
  if (!url) return true // Empty is allowed
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const validateBrandName = (name: string | undefined): { valid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Brand name is required' }
  }
  if (name.length < 2) {
    return { valid: false, error: 'Brand name must be at least 2 characters' }
  }
  if (name.length > 100) {
    return { valid: false, error: 'Brand name must not exceed 100 characters' }
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

const validateLogoUrl = (url: string | undefined): { valid: boolean; error?: string } => {
  if (url && !isValidUrl(url)) {
    return { valid: false, error: 'Invalid logo URL format' }
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

// ==================== LIST BRANDS ====================

/**
 * GET /api/brands/list
 * Returns all brands for the current user's business
 * Query params: page, limit, search, sort
 */
export const listBrands: PayloadHandler = async (req): Promise<Response> => {
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
    const sort = url.searchParams.get('sort') || '-createdAt'

    // Build where clause
    const whereClause: any = {
      business: { equals: businessId },
    }

    // Add search filter
    if (search) {
      whereClause.brand_name = { contains: search }
    }

    const brands = await payload.find({
      collection: 'brands',
      where: whereClause,
      depth: 0,
      overrideAccess: true,
      page,
      limit,
      sort,
    })

    return Response.json({
      success: true,
      data: brands.docs,
      totalDocs: brands.totalDocs,
      totalPages: brands.totalPages,
      page: brands.page,
      limit: brands.limit,
      hasNextPage: brands.hasNextPage,
      hasPrevPage: brands.hasPrevPage,
    })
  } catch (error: any) {
    console.error('List Brands Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch brands' }, { status: 500 })
  }
}

// ==================== GET BRAND ====================

/**
 * GET /api/brands/:id
 * Returns a single brand by ID
 */
export const getBrand: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Brand ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const brand = await payload.findByID({
      collection: 'brands',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!brand) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Check if brand belongs to user's business
    const brandBusiness = brand.business
    if (!brandBusiness) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }
    const brandBusinessId = typeof brandBusiness === 'object' ? brandBusiness.id : brandBusiness
    if (brandBusinessId !== businessId) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: brand,
    })
  } catch (error: any) {
    console.error('Get Brand Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch brand' }, { status: 500 })
  }
}

// ==================== CREATE BRAND ====================

/**
 * POST /api/brands/create
 * Creates a new brand
 */
export const createBrand: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  // Validate brand_name
  const nameValidation = validateBrandName(data.brand_name)
  if (!nameValidation.valid) {
    return Response.json({ error: nameValidation.error }, { status: 400 })
  }

  // Validate description
  const descValidation = validateDescription(data.description)
  if (!descValidation.valid) {
    return Response.json({ error: descValidation.error }, { status: 400 })
  }

  // Validate logo_url
  const logoValidation = validateLogoUrl(data.logo_url)
  if (!logoValidation.valid) {
    return Response.json({ error: logoValidation.error }, { status: 400 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if brand name already exists for this business
    const existingBrand = await payload.find({
      collection: 'brands',
      where: {
        business: { equals: businessId },
        brand_name: { equals: data.brand_name.trim() },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingBrand.totalDocs > 0) {
      return Response.json({ error: 'Brand with this name already exists' }, { status: 409 })
    }

    const brand = await payload.create({
      collection: 'brands',
      data: {
        brand_name: data.brand_name.trim(),
        description: data.description?.trim() || '',
        logo_url: data.logo_url?.trim() || '',
        business: businessId,
      },
      overrideAccess: true,
    })

    return Response.json(
      {
        success: true,
        message: 'Brand created successfully',
        data: stripBusinessDetails(brand),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Create Brand Error:', error)
    return Response.json({ error: error.message || 'Failed to create brand' }, { status: 500 })
  }
}

// ==================== UPDATE BRAND ====================

/**
 * PATCH /api/brands/:id
 * Updates a brand
 */
export const updateBrand: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Brand ID is required' }, { status: 400 })
  }

  // Validate brand_name if provided
  if (data.brand_name !== undefined) {
    const nameValidation = validateBrandName(data.brand_name)
    if (!nameValidation.valid) {
      return Response.json({ error: nameValidation.error }, { status: 400 })
    }
  }

  // Validate description if provided
  if (data.description !== undefined) {
    const descValidation = validateDescription(data.description)
    if (!descValidation.valid) {
      return Response.json({ error: descValidation.error }, { status: 400 })
    }
  }

  // Validate logo_url if provided
  if (data.logo_url !== undefined) {
    const logoValidation = validateLogoUrl(data.logo_url)
    if (!logoValidation.valid) {
      return Response.json({ error: logoValidation.error }, { status: 400 })
    }
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // First check if brand exists and belongs to user's business
    const existingBrand = await payload.findByID({
      collection: 'brands',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingBrand) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }

    const existingBrandBusiness = existingBrand.business
    if (!existingBrandBusiness) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }
    const brandBusinessId =
      typeof existingBrandBusiness === 'object' ? existingBrandBusiness.id : existingBrandBusiness
    if (brandBusinessId !== businessId) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Check if new brand name already exists (if name is being changed)
    if (data.brand_name && data.brand_name.trim() !== existingBrand.brand_name) {
      const duplicateBrand = await payload.find({
        collection: 'brands',
        where: {
          business: { equals: businessId },
          brand_name: { equals: data.brand_name.trim() },
          id: { not_equals: id },
        },
        limit: 1,
        overrideAccess: true,
      })

      if (duplicateBrand.totalDocs > 0) {
        return Response.json({ error: 'Brand with this name already exists' }, { status: 409 })
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (data.brand_name !== undefined) updateData.brand_name = data.brand_name.trim()
    if (data.description !== undefined) updateData.description = data.description.trim()
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url.trim()

    const updatedBrand = await payload.update({
      collection: 'brands',
      id,
      data: updateData,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Brand updated successfully',
      data: stripBusinessDetails(updatedBrand),
    })
  } catch (error: any) {
    console.error('Update Brand Error:', error)
    return Response.json({ error: error.message || 'Failed to update brand' }, { status: 500 })
  }
}

// ==================== DELETE BRAND ====================

/**
 * DELETE /api/brands/:id
 * Deletes a brand
 */
export const deleteBrand: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Brand ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // First check if brand exists and belongs to user's business
    const existingBrand = await payload.findByID({
      collection: 'brands',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingBrand) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }

    const existingBrandBusiness = existingBrand.business
    if (!existingBrandBusiness) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }
    const brandBusinessId =
      typeof existingBrandBusiness === 'object' ? existingBrandBusiness.id : existingBrandBusiness
    if (brandBusinessId !== businessId) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Check if brand is linked to any products
    const linkedProducts = await payload.find({
      collection: 'products',
      where: {
        brand: { equals: id },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (linkedProducts.totalDocs > 0) {
      return Response.json(
        {
          error: `Cannot delete brand, it is linked to ${linkedProducts.totalDocs} product(s)`,
        },
        { status: 409 },
      )
    }

    await payload.delete({
      collection: 'brands',
      id,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Brand deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete Brand Error:', error)
    return Response.json({ error: error.message || 'Failed to delete brand' }, { status: 500 })
  }
}
