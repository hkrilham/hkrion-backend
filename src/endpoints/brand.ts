/**
 * ============================================================================
 * BRAND ENDPOINTS
 * ============================================================================
 *
 * This module provides REST API endpoints for brand management.
 * All endpoints are protected and require authentication.
 * Users can only access brands belonging to their business (multi-tenant).
 *
 * Available Endpoints:
 * - GET    /api/brands/list     - List all brands with pagination & search
 * - GET    /api/brands/:id      - Get a single brand by ID
 * - POST   /api/brands/create   - Create a new brand
 * - PATCH  /api/brands/:id      - Update an existing brand
 * - DELETE /api/brands/:id      - Delete a brand (if not linked to products)
 *
 * @module endpoints/brand
 * @author HKRiON Team
 * @version 1.0.0
 */

import { PayloadHandler } from 'payload'
import type { Brand, User, Business } from '../payload-types'
import type { Where } from 'payload'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Business reference type - can be a number (ID) or full Business object
 * This is common in Payload CMS when depth is used in queries
 */
type BusinessRef = number | Business | null | undefined

/**
 * Validation result interface for input validation functions
 */
interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean
  /** Error message if validation failed */
  error?: string
}

/**
 * Standardized brand response format for API responses
 * Strips unnecessary fields and ensures consistent structure
 */
interface BrandResponse {
  id: number
  brand_name: string
  description?: string | null
  logo_url?: string | null
  business: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts business ID from user object
 *
 * In Payload CMS, the `user.business` field can be either:
 * - A number (just the ID, when depth=0)
 * - A full Business object (when depth > 0)
 *
 * This helper handles both cases safely.
 *
 * @param user - The authenticated user object
 * @returns The business ID or null if user has no business
 *
 * @example
 * const businessId = getBusinessId(user)
 * if (!businessId) {
 *   return noBusinessResponse()
 * }
 */
const getBusinessId = (user: User): number | null => {
  if (!user.business) return null
  return typeof user.business === 'object' ? user.business.id : user.business
}

/**
 * Extracts ID from a business reference
 *
 * Similar to getBusinessId but works with any BusinessRef type.
 * Useful when extracting business ID from a brand's business field.
 *
 * @param businessRef - Business reference (ID or object)
 * @returns The business ID or null
 */
const extractBusinessId = (businessRef: BusinessRef): number | null => {
  if (!businessRef) return null
  return typeof businessRef === 'object' ? businessRef.id : businessRef
}

/**
 * Formats a Brand document for API response
 *
 * This function:
 * - Strips the full business object, keeping only the ID
 * - Ensures consistent response structure
 * - Returns only the fields needed by the client
 *
 * @param brand - The brand document from database
 * @returns Formatted brand response object
 *
 * @example
 * const brand = await payload.findByID({ collection: 'brands', id: '1' })
 * return Response.json({ data: formatBrandResponse(brand) })
 */
const formatBrandResponse = (brand: Brand): BrandResponse => {
  return {
    id: brand.id,
    brand_name: brand.brand_name,
    description: brand.description,
    logo_url: brand.logo_url,
    business: extractBusinessId(brand.business) || 0,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  }
}

/**
 * Checks if a brand belongs to the specified business
 *
 * Used for multi-tenant access control - ensures users can only
 * access brands from their own business.
 *
 * @param brand - The brand document to check
 * @param businessId - The business ID to compare against
 * @returns True if brand belongs to the business
 */
const isBrandOwnedByBusiness = (brand: Brand, businessId: number): boolean => {
  const brandBusinessId = extractBusinessId(brand.business)
  return brandBusinessId === businessId
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates if a string is a valid URL
 *
 * @param url - URL string to validate
 * @returns True if valid URL or empty string
 */
const isValidUrl = (url: string): boolean => {
  if (!url) return true // Empty is allowed
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates brand name
 *
 * Rules:
 * - Required (cannot be empty)
 * - Minimum 2 characters
 * - Maximum 100 characters
 *
 * @param name - Brand name to validate
 * @returns Validation result with error message if invalid
 */
const validateBrandName = (name: string | undefined): ValidationResult => {
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

/**
 * Validates brand description
 *
 * Rules:
 * - Optional (can be empty)
 * - Maximum 500 characters
 *
 * @param description - Description to validate
 * @returns Validation result with error message if invalid
 */
const validateDescription = (description: string | undefined): ValidationResult => {
  if (description && description.length > 500) {
    return { valid: false, error: 'Description must not exceed 500 characters' }
  }
  return { valid: true }
}

/**
 * Validates brand logo URL
 *
 * Rules:
 * - Optional (can be empty)
 * - Must be valid URL format if provided
 *
 * @param url - Logo URL to validate
 * @returns Validation result with error message if invalid
 */
const validateLogoUrl = (url: string | undefined): ValidationResult => {
  if (url && !isValidUrl(url)) {
    return { valid: false, error: 'Invalid logo URL format' }
  }
  return { valid: true }
}

// ============================================================================
// STANDARD ERROR RESPONSES
// ============================================================================

/**
 * Returns 401 Unauthorized response
 * Used when user is not authenticated
 */
const unauthorizedResponse = () => Response.json({ error: 'Unauthorized' }, { status: 401 })

/**
 * Returns 404 Not Found response for missing business
 * Used when user has no business associated
 */
const noBusinessResponse = () =>
  Response.json({ error: 'No business associated with this user' }, { status: 404 })

/**
 * Returns 404 Not Found response for missing brand
 * Used when brand doesn't exist or doesn't belong to user's business
 */
const brandNotFoundResponse = () => Response.json({ error: 'Brand not found' }, { status: 404 })

/**
 * Returns 400 Bad Request response for missing brand ID
 * Used when ID parameter is not provided
 */
const brandIdRequiredResponse = () =>
  Response.json({ error: 'Brand ID is required' }, { status: 400 })

// ============================================================================
// LIST BRANDS ENDPOINT
// ============================================================================

/**
 * List all brands for the current user's business
 *
 * @route GET /api/brands/list
 *
 * @queryParam {number} [page=1] - Page number for pagination
 * @queryParam {number} [limit=10] - Number of items per page (max: 100)
 * @queryParam {string} [search] - Search term to filter by brand name
 * @queryParam {string} [sort=-createdAt] - Sort field (prefix with - for descending)
 *
 * @returns {Object} Paginated list of brands
 * @returns {boolean} success - Whether the request was successful
 * @returns {BrandResponse[]} data - Array of brand objects
 * @returns {number} totalDocs - Total number of brands
 * @returns {number} totalPages - Total number of pages
 * @returns {number} page - Current page number
 * @returns {number} limit - Items per page
 * @returns {boolean} hasNextPage - Whether there is a next page
 * @returns {boolean} hasPrevPage - Whether there is a previous page
 *
 * @example
 * // Request
 * GET /api/brands/list?page=1&limit=10&search=samsung&sort=-createdAt
 *
 * // Response
 * {
 *   "success": true,
 *   "data": [{ "id": 1, "brand_name": "Samsung", ... }],
 *   "totalDocs": 25,
 *   "totalPages": 3,
 *   "page": 1,
 *   "limit": 10,
 *   "hasNextPage": true,
 *   "hasPrevPage": false
 * }
 */
export const listBrands: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Authentication Check
  // ─────────────────────────────────────────────────────────────────────────
  if (!user) {
    return unauthorizedResponse()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: Business Authorization Check
  // ─────────────────────────────────────────────────────────────────────────
  const businessId = getBusinessId(user)
  if (!businessId) {
    return noBusinessResponse()
  }

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // Step 3: Parse Query Parameters
    // ─────────────────────────────────────────────────────────────────────────
    // Note: We use 'http://localhost' as base URL for parsing relative URLs.
    // This is safe because we only use it to extract query parameters.
    const url = new URL(req.url || '', 'http://localhost')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100) // Cap at 100
    const search = url.searchParams.get('search') || ''
    const sort = url.searchParams.get('sort') || '-createdAt'

    // ─────────────────────────────────────────────────────────────────────────
    // Step 4: Build Query Filter
    // ─────────────────────────────────────────────────────────────────────────
    const whereClause: Where = {
      // Multi-tenant filter: Only show brands for user's business
      business: { equals: businessId },
    }

    // Add optional search filter
    if (search) {
      whereClause.brand_name = { contains: search }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Execute Query
    // ─────────────────────────────────────────────────────────────────────────
    const brands = await payload.find({
      collection: 'brands',
      where: whereClause,
      depth: 0, // Don't populate relationships (faster)
      overrideAccess: true, // We handle access control manually
      page,
      limit,
      sort,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Step 6: Return Success Response
    // ─────────────────────────────────────────────────────────────────────────
    return Response.json({
      success: true,
      data: brands.docs.map(formatBrandResponse),
      totalDocs: brands.totalDocs,
      totalPages: brands.totalPages,
      page: brands.page,
      limit: brands.limit,
      hasNextPage: brands.hasNextPage,
      hasPrevPage: brands.hasPrevPage,
    })
  } catch (error: unknown) {
    // ─────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────────────────────────────────
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch brands'
    console.error('List Brands Error:', error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

// ============================================================================
// GET SINGLE BRAND ENDPOINT
// ============================================================================

/**
 * Get a single brand by ID
 *
 * @route GET /api/brands/:id
 *
 * @param {string} id - Brand ID (from URL path)
 *
 * @returns {Object} Brand details
 * @returns {boolean} success - Whether the request was successful
 * @returns {BrandResponse} data - Brand object
 *
 * @throws {401} If user is not authenticated
 * @throws {400} If brand ID is not provided
 * @throws {404} If brand not found or doesn't belong to user's business
 *
 * @example
 * // Request
 * GET /api/brands/123
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "brand_name": "Samsung",
 *     "description": "Electronics manufacturer",
 *     "logo_url": "https://example.com/samsung.png",
 *     "business": 1,
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "updatedAt": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 */
export const getBrand: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Authentication Check
  // ─────────────────────────────────────────────────────────────────────────
  if (!user) {
    return unauthorizedResponse()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: Validate Required Parameters
  // ─────────────────────────────────────────────────────────────────────────
  if (!id) {
    return brandIdRequiredResponse()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3: Business Authorization Check
  // ─────────────────────────────────────────────────────────────────────────
  const businessId = getBusinessId(user)
  if (!businessId) {
    return noBusinessResponse()
  }

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // Step 4: Fetch Brand from Database
    // ─────────────────────────────────────────────────────────────────────────
    // Note: payload.findByID throws NotFound error if ID doesn't exist.
    // We catch this and return 404 instead of letting it bubble up as 500.
    let brand: Brand | null = null
    try {
      brand = await payload.findByID({
        collection: 'brands',
        id,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      // findByID throws NotFound error for invalid/non-existent IDs
      return brandNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Ownership Verification
    // ─────────────────────────────────────────────────────────────────────────
    // Ensure brand belongs to user's business (multi-tenant security)
    if (!brand || !isBrandOwnedByBusiness(brand, businessId)) {
      return brandNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 6: Return Success Response
    // ─────────────────────────────────────────────────────────────────────────
    return Response.json({
      success: true,
      data: formatBrandResponse(brand),
    })
  } catch (error: unknown) {
    // ─────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────────────────────────────────
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch brand'
    console.error('Get Brand Error:', error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

// ============================================================================
// CREATE BRAND ENDPOINT
// ============================================================================

/**
 * Create a new brand
 *
 * @route POST /api/brands/create
 *
 * @bodyParam {string} brand_name - Brand name (required, 2-100 chars)
 * @bodyParam {string} [description] - Brand description (optional, max 500 chars)
 * @bodyParam {string} [logo_url] - Brand logo URL (optional, valid URL format)
 *
 * @returns {Object} Created brand
 * @returns {boolean} success - Whether the request was successful
 * @returns {string} message - Success message
 * @returns {BrandResponse} data - Created brand object
 *
 * @throws {401} If user is not authenticated
 * @throws {400} If validation fails
 * @throws {404} If user has no business associated
 * @throws {409} If brand with same name already exists
 *
 * @example
 * // Request
 * POST /api/brands/create
 * {
 *   "brand_name": "Samsung",
 *   "description": "Electronics manufacturer",
 *   "logo_url": "https://example.com/samsung.png"
 * }
 *
 * // Response (201 Created)
 * {
 *   "success": true,
 *   "message": "Brand created successfully",
 *   "data": { "id": 123, "brand_name": "Samsung", ... }
 * }
 */
export const createBrand: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Authentication Check
  // ─────────────────────────────────────────────────────────────────────────
  if (!user) {
    return unauthorizedResponse()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: Business Authorization Check
  // ─────────────────────────────────────────────────────────────────────────
  const businessId = getBusinessId(user)
  if (!businessId) {
    return noBusinessResponse()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3: Input Validation
  // ─────────────────────────────────────────────────────────────────────────
  // Validate brand_name (required)
  const nameValidation = validateBrandName(data.brand_name)
  if (!nameValidation.valid) {
    return Response.json({ error: nameValidation.error }, { status: 400 })
  }

  // Validate description (optional)
  const descValidation = validateDescription(data.description)
  if (!descValidation.valid) {
    return Response.json({ error: descValidation.error }, { status: 400 })
  }

  // Validate logo_url (optional)
  const logoValidation = validateLogoUrl(data.logo_url)
  if (!logoValidation.valid) {
    return Response.json({ error: logoValidation.error }, { status: 400 })
  }

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // Step 4: Check for Duplicate Brand Name
    // ─────────────────────────────────────────────────────────────────────────
    // Brand names must be unique within a business
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

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Create Brand
    // ─────────────────────────────────────────────────────────────────────────
    const brand = await payload.create({
      collection: 'brands',
      data: {
        brand_name: data.brand_name.trim(),
        description: data.description?.trim() || '',
        logo_url: data.logo_url?.trim() || '',
        business: businessId, // Associate with user's business
      },
      overrideAccess: true,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Step 6: Return Success Response
    // ─────────────────────────────────────────────────────────────────────────
    return Response.json(
      {
        success: true,
        message: 'Brand created successfully',
        data: formatBrandResponse(brand),
      },
      { status: 201 }, // 201 Created
    )
  } catch (error: unknown) {
    // ─────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────────────────────────────────
    const errorMessage = error instanceof Error ? error.message : 'Failed to create brand'
    console.error('Create Brand Error:', error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

// ============================================================================
// UPDATE BRAND ENDPOINT
// ============================================================================

/**
 * Update an existing brand
 *
 * @route PATCH /api/brands/:id
 *
 * @param {string} id - Brand ID (from URL path)
 *
 * @bodyParam {string} [brand_name] - New brand name (2-100 chars)
 * @bodyParam {string} [description] - New description (max 500 chars)
 * @bodyParam {string} [logo_url] - New logo URL (valid URL format)
 *
 * @returns {Object} Updated brand
 * @returns {boolean} success - Whether the request was successful
 * @returns {string} message - Success message
 * @returns {BrandResponse} data - Updated brand object
 *
 * @throws {401} If user is not authenticated
 * @throws {400} If validation fails or ID not provided
 * @throws {404} If brand not found or doesn't belong to user's business
 * @throws {409} If new brand name already exists
 *
 * @example
 * // Request
 * PATCH /api/brands/123
 * {
 *   "brand_name": "Samsung Electronics",
 *   "description": "Updated description"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "message": "Brand updated successfully",
 *   "data": { "id": 123, "brand_name": "Samsung Electronics", ... }
 * }
 */
export const updateBrand: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string
  const data = req.json ? await req.json() : {}

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Authentication Check
  // ─────────────────────────────────────────────────────────────────────────
  if (!user) {
    return unauthorizedResponse()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: Validate Required Parameters
  // ─────────────────────────────────────────────────────────────────────────
  if (!id) {
    return brandIdRequiredResponse()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3: Business Authorization Check
  // ─────────────────────────────────────────────────────────────────────────
  const businessId = getBusinessId(user)
  if (!businessId) {
    return noBusinessResponse()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 4: Input Validation (only for provided fields)
  // ─────────────────────────────────────────────────────────────────────────
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
    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Fetch Existing Brand
    // ─────────────────────────────────────────────────────────────────────────
    // Note: payload.findByID throws NotFound error if ID doesn't exist
    let existingBrand: Brand | null = null
    try {
      existingBrand = await payload.findByID({
        collection: 'brands',
        id,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      // findByID throws NotFound error for invalid/non-existent IDs
      return brandNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 6: Ownership Verification
    // ─────────────────────────────────────────────────────────────────────────
    if (!existingBrand || !isBrandOwnedByBusiness(existingBrand, businessId)) {
      return brandNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 7: Check for Duplicate Name (if name is being changed)
    // ─────────────────────────────────────────────────────────────────────────
    if (data.brand_name && data.brand_name.trim() !== existingBrand.brand_name) {
      const duplicateBrand = await payload.find({
        collection: 'brands',
        where: {
          business: { equals: businessId },
          brand_name: { equals: data.brand_name.trim() },
          id: { not_equals: id }, // Exclude current brand from check
        },
        limit: 1,
        overrideAccess: true,
      })

      if (duplicateBrand.totalDocs > 0) {
        return Response.json({ error: 'Brand with this name already exists' }, { status: 409 })
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 8: Prepare and Execute Update
    // ─────────────────────────────────────────────────────────────────────────
    // Only include fields that were provided in the request
    const updateData: Partial<Pick<Brand, 'brand_name' | 'description' | 'logo_url'>> = {}
    if (data.brand_name !== undefined) updateData.brand_name = data.brand_name.trim()
    if (data.description !== undefined) updateData.description = data.description.trim()
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url.trim()

    const updatedBrand = await payload.update({
      collection: 'brands',
      id,
      data: updateData,
      overrideAccess: true,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Step 9: Return Success Response
    // ─────────────────────────────────────────────────────────────────────────
    return Response.json({
      success: true,
      message: 'Brand updated successfully',
      data: formatBrandResponse(updatedBrand),
    })
  } catch (error: unknown) {
    // ─────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────────────────────────────────
    const errorMessage = error instanceof Error ? error.message : 'Failed to update brand'
    console.error('Update Brand Error:', error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

// ============================================================================
// DELETE BRAND ENDPOINT
// ============================================================================

/**
 * Delete a brand
 *
 * @route DELETE /api/brands/:id
 *
 * @param {string} id - Brand ID (from URL path)
 *
 * @returns {Object} Success message
 * @returns {boolean} success - Whether the request was successful
 * @returns {string} message - Success message
 *
 * @throws {401} If user is not authenticated
 * @throws {400} If brand ID is not provided
 * @throws {404} If brand not found or doesn't belong to user's business
 * @throws {409} If brand is linked to products (cannot delete)
 *
 * @note Brands linked to products cannot be deleted. The associated products
 *       must be updated or deleted first.
 *
 * @example
 * // Request
 * DELETE /api/brands/123
 *
 * // Response
 * {
 *   "success": true,
 *   "message": "Brand deleted successfully"
 * }
 *
 * // Error Response (409 Conflict)
 * {
 *   "error": "Cannot delete brand, it is linked to 5 product(s)"
 * }
 */
export const deleteBrand: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Authentication Check
  // ─────────────────────────────────────────────────────────────────────────
  if (!user) {
    return unauthorizedResponse()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: Validate Required Parameters
  // ─────────────────────────────────────────────────────────────────────────
  if (!id) {
    return brandIdRequiredResponse()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3: Business Authorization Check
  // ─────────────────────────────────────────────────────────────────────────
  const businessId = getBusinessId(user)
  if (!businessId) {
    return noBusinessResponse()
  }

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // Step 4: Fetch Existing Brand
    // ─────────────────────────────────────────────────────────────────────────
    let existingBrand: Brand | null = null
    try {
      existingBrand = await payload.findByID({
        collection: 'brands',
        id,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      // findByID throws NotFound error for invalid/non-existent IDs
      return brandNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Ownership Verification
    // ─────────────────────────────────────────────────────────────────────────
    if (!existingBrand || !isBrandOwnedByBusiness(existingBrand, businessId)) {
      return brandNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 6: Check for Linked Products (Referential Integrity)
    // ─────────────────────────────────────────────────────────────────────────
    // Prevent deletion if brand is used by any products
    const linkedProducts = await payload.find({
      collection: 'products',
      where: {
        brand: { equals: id },
      },
      limit: 1, // We only need to know if any exist
      overrideAccess: true,
    })

    if (linkedProducts.totalDocs > 0) {
      return Response.json(
        {
          error: `Cannot delete brand, it is linked to ${linkedProducts.totalDocs} product(s)`,
        },
        { status: 409 }, // 409 Conflict
      )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 7: Delete Brand
    // ─────────────────────────────────────────────────────────────────────────
    await payload.delete({
      collection: 'brands',
      id,
      overrideAccess: true,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Step 8: Return Success Response
    // ─────────────────────────────────────────────────────────────────────────
    return Response.json({
      success: true,
      message: 'Brand deleted successfully',
    })
  } catch (error: unknown) {
    // ─────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────────────────────────────────
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete brand'
    console.error('Delete Brand Error:', error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
