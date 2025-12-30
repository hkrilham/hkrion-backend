import { PayloadHandler } from 'payload'

// ==================== HELPER FUNCTIONS ====================

// Generate unique location ID
const generateLocationId = async (payload: any, businessId: number): Promise<string> => {
  const existingLocations = await payload.find({
    collection: 'business-locations',
    where: { business: { equals: businessId } },
    limit: 0,
    overrideAccess: true,
  })
  const count = existingLocations.totalDocs + 1
  return `LOC-${businessId}-${String(count).padStart(3, '0')}`
}

// ==================== VALIDATION HELPERS ====================

const validateName = (name: string | undefined): { valid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Location name is required' }
  }
  if (name.length < 2) {
    return { valid: false, error: 'Location name must be at least 2 characters' }
  }
  if (name.length > 100) {
    return { valid: false, error: 'Location name must not exceed 100 characters' }
  }
  return { valid: true }
}

const validateCity = (city: string | undefined): { valid: boolean; error?: string } => {
  if (!city || city.trim() === '') {
    return { valid: false, error: 'City is required' }
  }
  if (city.length < 2 || city.length > 100) {
    return { valid: false, error: 'City must be between 2-100 characters' }
  }
  return { valid: true }
}

const validateState = (state: string | undefined): { valid: boolean; error?: string } => {
  if (!state || state.trim() === '') {
    return { valid: false, error: 'State is required' }
  }
  if (state.length < 2 || state.length > 100) {
    return { valid: false, error: 'State must be between 2-100 characters' }
  }
  return { valid: true }
}

const validateZipCode = (zipCode: string | undefined): { valid: boolean; error?: string } => {
  if (!zipCode || zipCode.trim() === '') {
    return { valid: false, error: 'Zip code is required' }
  }
  return { valid: true }
}

const validateCountry = (country: string | undefined): { valid: boolean; error?: string } => {
  if (!country || country.trim() === '') {
    return { valid: false, error: 'Country is required' }
  }
  if (country.length < 2 || country.length > 100) {
    return { valid: false, error: 'Country must be between 2-100 characters' }
  }
  return { valid: true }
}

const validateEmail = (email: string | undefined): { valid: boolean; error?: string } => {
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }
  return { valid: true }
}

// Helper to strip full business details from response
const stripBusinessDetails = (doc: any): any => {
  if (!doc) return doc
  const result = { ...doc }
  if (result.business && typeof result.business === 'object') {
    result.business = result.business.id
  }
  if (
    result.default_selling_price_group &&
    typeof result.default_selling_price_group === 'object'
  ) {
    result.default_selling_price_group = result.default_selling_price_group.id
  }
  return result
}

// ==================== LIST LOCATIONS ====================

/**
 * GET /api/business-locations/list
 * Returns all locations for the current user's business
 */
export const listLocations: PayloadHandler = async (req): Promise<Response> => {
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
    const isActive = url.searchParams.get('is_active')

    // Build where clause
    const whereClause: any = {
      business: { equals: businessId },
    }

    // Add search filter
    if (search) {
      whereClause.or = [
        { name: { contains: search } },
        { location_id: { contains: search } },
        { city: { contains: search } },
      ]
    }

    // Active filter
    if (isActive === 'true') {
      whereClause.is_active = { equals: true }
    } else if (isActive === 'false') {
      whereClause.is_active = { equals: false }
    }

    const locations = await payload.find({
      collection: 'business-locations',
      where: whereClause,
      depth: 0,
      overrideAccess: true,
      page,
      limit,
      sort,
    })

    return Response.json({
      success: true,
      data: locations.docs,
      totalDocs: locations.totalDocs,
      totalPages: locations.totalPages,
      page: locations.page,
      limit: locations.limit,
      hasNextPage: locations.hasNextPage,
      hasPrevPage: locations.hasPrevPage,
    })
  } catch (error: any) {
    console.error('List Locations Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch locations' }, { status: 500 })
  }
}

// ==================== GET LOCATION ====================

/**
 * GET /api/business-locations/:id
 * Returns a single location by ID
 */
export const getLocation: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Location ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const location = await payload.findByID({
      collection: 'business-locations',
      id,
      depth: 1,
      overrideAccess: true,
    })

    if (!location) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }

    const locBusiness = location.business
    if (!locBusiness) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }
    const locBusinessId = typeof locBusiness === 'object' ? locBusiness.id : locBusiness
    if (locBusinessId !== businessId) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: stripBusinessDetails(location),
    })
  } catch (error: any) {
    console.error('Get Location Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch location' }, { status: 500 })
  }
}

// ==================== CREATE LOCATION ====================

/**
 * POST /api/business-locations/create
 * Creates a new location
 */
export const createLocation: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  // Validations
  const nameValidation = validateName(data.name)
  if (!nameValidation.valid) {
    return Response.json({ error: nameValidation.error }, { status: 400 })
  }

  const cityValidation = validateCity(data.city)
  if (!cityValidation.valid) {
    return Response.json({ error: cityValidation.error }, { status: 400 })
  }

  const stateValidation = validateState(data.state)
  if (!stateValidation.valid) {
    return Response.json({ error: stateValidation.error }, { status: 400 })
  }

  const zipValidation = validateZipCode(data.zip_code)
  if (!zipValidation.valid) {
    return Response.json({ error: zipValidation.error }, { status: 400 })
  }

  const countryValidation = validateCountry(data.country)
  if (!countryValidation.valid) {
    return Response.json({ error: countryValidation.error }, { status: 400 })
  }

  const emailValidation = validateEmail(data.email)
  if (!emailValidation.valid) {
    return Response.json({ error: emailValidation.error }, { status: 400 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if name already exists for this business
    const existingLocation = await payload.find({
      collection: 'business-locations',
      where: {
        business: { equals: businessId },
        name: { equals: data.name.trim() },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingLocation.totalDocs > 0) {
      return Response.json({ error: 'Location with this name already exists' }, { status: 409 })
    }

    // Generate or use provided location_id
    let locationId = data.location_id?.trim()
    if (!locationId) {
      locationId = await generateLocationId(payload, businessId)
    } else {
      // Check if location_id is unique
      const existingId = await payload.find({
        collection: 'business-locations',
        where: {
          business: { equals: businessId },
          location_id: { equals: locationId },
        },
        limit: 1,
        overrideAccess: true,
      })

      if (existingId.totalDocs > 0) {
        return Response.json({ error: 'Location ID already exists' }, { status: 409 })
      }
    }

    // Validate default_selling_price_group if provided
    if (data.default_selling_price_group) {
      try {
        const priceGroup = await payload.findByID({
          collection: 'selling-price-groups',
          id: data.default_selling_price_group,
          overrideAccess: true,
        })
        const pgBusiness = priceGroup?.business
        const pgBusinessId = typeof pgBusiness === 'object' ? pgBusiness?.id : pgBusiness
        if (pgBusinessId !== businessId) {
          return Response.json(
            { error: 'Price group does not belong to your business' },
            { status: 400 },
          )
        }
      } catch {
        return Response.json({ error: 'Price group not found' }, { status: 400 })
      }
    }

    // If setting as default, unset existing default
    if (data.is_default === true) {
      await payload.update({
        collection: 'business-locations',
        where: {
          business: { equals: businessId },
          is_default: { equals: true },
        },
        data: { is_default: false },
        overrideAccess: true,
      })
    }

    const location = await payload.create({
      collection: 'business-locations',
      data: {
        name: data.name.trim(),
        location_id: locationId,
        landmark: data.landmark?.trim() || '',
        city: data.city.trim(),
        state: data.state.trim(),
        zip_code: data.zip_code.trim(),
        country: data.country.trim(),
        mobile: data.mobile?.trim() || '',
        email: data.email?.trim() || '',
        alternate_contact_number: data.alternate_contact_number?.trim() || '',
        website: data.website?.trim() || '',
        invoice_scheme_pos: data.invoice_scheme_pos || 'Default',
        invoice_layout_pos: data.invoice_layout_pos || 'Default',
        invoice_scheme_sale: data.invoice_scheme_sale || 'Default',
        invoice_layout_sale: data.invoice_layout_sale || 'Default',
        default_selling_price_group: data.default_selling_price_group || null,
        is_active: data.is_active !== false,
        is_default: data.is_default || false,
        business: businessId,
      },
      overrideAccess: true,
    })

    return Response.json(
      {
        success: true,
        message: 'Location created successfully',
        data: stripBusinessDetails(location),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Create Location Error:', error)
    return Response.json({ error: error.message || 'Failed to create location' }, { status: 500 })
  }
}

// ==================== UPDATE LOCATION ====================

/**
 * PATCH /api/business-locations/:id
 * Updates a location
 */
export const updateLocation: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Location ID is required' }, { status: 400 })
  }

  // Validations if provided
  if (data.name !== undefined) {
    const nameValidation = validateName(data.name)
    if (!nameValidation.valid) {
      return Response.json({ error: nameValidation.error }, { status: 400 })
    }
  }

  if (data.city !== undefined) {
    const cityValidation = validateCity(data.city)
    if (!cityValidation.valid) {
      return Response.json({ error: cityValidation.error }, { status: 400 })
    }
  }

  if (data.state !== undefined) {
    const stateValidation = validateState(data.state)
    if (!stateValidation.valid) {
      return Response.json({ error: stateValidation.error }, { status: 400 })
    }
  }

  if (data.zip_code !== undefined) {
    const zipValidation = validateZipCode(data.zip_code)
    if (!zipValidation.valid) {
      return Response.json({ error: zipValidation.error }, { status: 400 })
    }
  }

  if (data.country !== undefined) {
    const countryValidation = validateCountry(data.country)
    if (!countryValidation.valid) {
      return Response.json({ error: countryValidation.error }, { status: 400 })
    }
  }

  if (data.email !== undefined) {
    const emailValidation = validateEmail(data.email)
    if (!emailValidation.valid) {
      return Response.json({ error: emailValidation.error }, { status: 400 })
    }
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if location exists and belongs to user's business
    const existingLocation = await payload.findByID({
      collection: 'business-locations',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingLocation) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }

    const locBusiness = existingLocation.business
    if (!locBusiness) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }
    const locBusinessId = typeof locBusiness === 'object' ? locBusiness.id : locBusiness
    if (locBusinessId !== businessId) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }

    // Check for duplicate name
    if (data.name && data.name.trim() !== existingLocation.name) {
      const duplicateLocation = await payload.find({
        collection: 'business-locations',
        where: {
          business: { equals: businessId },
          name: { equals: data.name.trim() },
          id: { not_equals: id },
        },
        limit: 1,
        overrideAccess: true,
      })

      if (duplicateLocation.totalDocs > 0) {
        return Response.json({ error: 'Location with this name already exists' }, { status: 409 })
      }
    }

    // Validate price group if provided
    if (data.default_selling_price_group) {
      try {
        const priceGroup = await payload.findByID({
          collection: 'selling-price-groups',
          id: data.default_selling_price_group,
          overrideAccess: true,
        })
        const pgBusiness = priceGroup?.business
        const pgBusinessId = typeof pgBusiness === 'object' ? pgBusiness?.id : pgBusiness
        if (pgBusinessId !== businessId) {
          return Response.json(
            { error: 'Price group does not belong to your business' },
            { status: 400 },
          )
        }
      } catch {
        return Response.json({ error: 'Price group not found' }, { status: 400 })
      }
    }

    // If setting as default, unset existing default
    if (data.is_default === true && !existingLocation.is_default) {
      await payload.update({
        collection: 'business-locations',
        where: {
          business: { equals: businessId },
          is_default: { equals: true },
        },
        data: { is_default: false },
        overrideAccess: true,
      })
    }

    // Prepare update data
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.location_id !== undefined) updateData.location_id = data.location_id.trim()
    if (data.landmark !== undefined) updateData.landmark = data.landmark.trim()
    if (data.city !== undefined) updateData.city = data.city.trim()
    if (data.state !== undefined) updateData.state = data.state.trim()
    if (data.zip_code !== undefined) updateData.zip_code = data.zip_code.trim()
    if (data.country !== undefined) updateData.country = data.country.trim()
    if (data.mobile !== undefined) updateData.mobile = data.mobile.trim()
    if (data.email !== undefined) updateData.email = data.email.trim()
    if (data.alternate_contact_number !== undefined)
      updateData.alternate_contact_number = data.alternate_contact_number.trim()
    if (data.website !== undefined) updateData.website = data.website.trim()
    if (data.invoice_scheme_pos !== undefined)
      updateData.invoice_scheme_pos = data.invoice_scheme_pos
    if (data.invoice_layout_pos !== undefined)
      updateData.invoice_layout_pos = data.invoice_layout_pos
    if (data.invoice_scheme_sale !== undefined)
      updateData.invoice_scheme_sale = data.invoice_scheme_sale
    if (data.invoice_layout_sale !== undefined)
      updateData.invoice_layout_sale = data.invoice_layout_sale
    if (data.default_selling_price_group !== undefined)
      updateData.default_selling_price_group = data.default_selling_price_group || null
    if (data.is_active !== undefined) updateData.is_active = data.is_active
    if (data.is_default !== undefined) updateData.is_default = data.is_default

    const updatedLocation = await payload.update({
      collection: 'business-locations',
      id,
      data: updateData,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Location updated successfully',
      data: stripBusinessDetails(updatedLocation),
    })
  } catch (error: any) {
    console.error('Update Location Error:', error)
    return Response.json({ error: error.message || 'Failed to update location' }, { status: 500 })
  }
}

// ==================== DELETE LOCATION ====================

/**
 * DELETE /api/business-locations/:id
 * Deletes a location
 */
export const deleteLocation: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Location ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const existingLocation = await payload.findByID({
      collection: 'business-locations',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingLocation) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }

    const locBusiness = existingLocation.business
    if (!locBusiness) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }
    const locBusinessId = typeof locBusiness === 'object' ? locBusiness.id : locBusiness
    if (locBusinessId !== businessId) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }

    // Check if it's the default location
    if (existingLocation.is_default) {
      return Response.json(
        { error: 'Cannot delete the default location. Set another location as default first.' },
        { status: 409 },
      )
    }

    // Check if it's the only location
    const locationCount = await payload.find({
      collection: 'business-locations',
      where: { business: { equals: businessId } },
      limit: 0,
      overrideAccess: true,
    })

    if (locationCount.totalDocs <= 1) {
      return Response.json(
        { error: 'Cannot delete the only location. A business must have at least one location.' },
        { status: 409 },
      )
    }

    await payload.delete({
      collection: 'business-locations',
      id,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Location deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete Location Error:', error)
    return Response.json({ error: error.message || 'Failed to delete location' }, { status: 500 })
  }
}

// ==================== SET DEFAULT LOCATION ====================

/**
 * POST /api/business-locations/:id/set-default
 * Sets a location as the default
 */
export const setDefaultLocation: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Location ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const existingLocation = await payload.findByID({
      collection: 'business-locations',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingLocation) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }

    const locBusiness = existingLocation.business
    if (!locBusiness) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }
    const locBusinessId = typeof locBusiness === 'object' ? locBusiness.id : locBusiness
    if (locBusinessId !== businessId) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }

    // Unset existing default
    await payload.update({
      collection: 'business-locations',
      where: {
        business: { equals: businessId },
        is_default: { equals: true },
      },
      data: { is_default: false },
      overrideAccess: true,
    })

    // Set new default
    const updatedLocation = await payload.update({
      collection: 'business-locations',
      id,
      data: { is_default: true },
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Default location updated successfully',
      data: stripBusinessDetails(updatedLocation),
    })
  } catch (error: any) {
    console.error('Set Default Location Error:', error)
    return Response.json(
      { error: error.message || 'Failed to set default location' },
      { status: 500 },
    )
  }
}

// ==================== SEED DEFAULT LOCATION ====================

/**
 * POST /api/business-locations/seed-defaults
 * Creates default location for existing businesses that don't have one
 */
export const seedDefaultLocation: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  const businessId = typeof user.business === 'object' ? user.business.id : user.business

  try {
    // Check if locations already exist for this business
    const existingLocations = await payload.find({
      collection: 'business-locations',
      where: { business: { equals: businessId } },
      limit: 1,
      overrideAccess: true,
    })

    if (existingLocations.totalDocs > 0) {
      return Response.json(
        { error: 'Locations already exist. Use the Locations API to manage them.' },
        { status: 409 },
      )
    }

    // Get business details to use city/country
    const business = await payload.findByID({
      collection: 'businesses',
      id: businessId,
      overrideAccess: true,
    })

    console.log(`Seeding default location for business: ${businessId}`)

    const location = await payload.create({
      collection: 'business-locations',
      data: {
        name: 'Main Store',
        location_id: `LOC-${businessId}-001`,
        city: business.city || 'Unknown',
        state: business.state || 'Unknown',
        zip_code: business.zip_code || '000000',
        country: business.country || 'Unknown',
        landmark: '',
        is_active: true,
        is_default: true,
        business: businessId,
      },
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Default location created successfully',
      data: stripBusinessDetails(location),
    })
  } catch (error: any) {
    console.error('Seed Default Location Error:', error)
    return Response.json(
      { error: error.message || 'Failed to seed default location' },
      { status: 500 },
    )
  }
}
