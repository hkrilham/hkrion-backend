/**
 * ============================================================================
 * CATEGORY ENDPOINTS
 * ============================================================================
 *
 * This module provides REST API endpoints for category management.
 * Categories support hierarchical structure (parent-child relationships).
 * All endpoints are protected and require authentication.
 * Users can only access categories belonging to their business (multi-tenant).
 *
 * Available Endpoints:
 * - GET    /api/categories/list     - List all categories with pagination & search
 * - GET    /api/categories/tree     - Get hierarchical category tree
 * - GET    /api/categories/:id      - Get a single category by ID
 * - POST   /api/categories/create   - Create a new category
 * - PATCH  /api/categories/:id      - Update an existing category
 * - DELETE /api/categories/:id      - Delete a category (if not linked)
 *
 * @module endpoints/category
 * @author HKRiON Team
 * @version 1.0.0
 */

import { PayloadHandler } from 'payload'
import type { Category, User, Business } from '../payload-types'
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
 * Category reference type - can be a number (ID) or full Category object
 */
type CategoryRef = number | Category | null | undefined

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
 * Standardized category response format for API responses
 * Strips unnecessary fields and ensures consistent structure
 */
interface CategoryResponse {
  id: number
  category_name: string
  category_code?: string | null
  description?: string | null
  hsn_code?: string | null
  parent_category: number | null
  business: number
  createdAt: string
  updatedAt: string
}

/**
 * Category tree node for hierarchical representation
 */
interface CategoryTreeNode {
  id: number
  category_name: string
  category_code?: string | null
  description?: string | null
  hsn_code?: string | null
  parent_category: number | null
  children: CategoryTreeNode[]
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
 * @param businessRef - Business reference (ID or object)
 * @returns The business ID or null
 */
const extractBusinessId = (businessRef: BusinessRef): number | null => {
  if (!businessRef) return null
  return typeof businessRef === 'object' ? businessRef.id : businessRef
}

/**
 * Extracts ID from a category reference
 *
 * @param categoryRef - Category reference (ID or object)
 * @returns The category ID or null
 */
const extractCategoryId = (categoryRef: CategoryRef): number | null => {
  if (!categoryRef) return null
  return typeof categoryRef === 'object' ? categoryRef.id : categoryRef
}

/**
 * Formats a Category document for API response
 *
 * This function:
 * - Strips the full business object, keeping only the ID
 * - Strips the full parent_category object, keeping only the ID
 * - Ensures consistent response structure
 *
 * @param category - The category document from database
 * @returns Formatted category response object
 */
const formatCategoryResponse = (category: Category): CategoryResponse => {
  return {
    id: category.id,
    category_name: category.category_name,
    category_code: category.category_code,
    description: category.description,
    hsn_code: category.hsn_code,
    parent_category: extractCategoryId(category.parent_category),
    business: extractBusinessId(category.business) || 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

/**
 * Checks if a category belongs to the specified business
 *
 * Used for multi-tenant access control - ensures users can only
 * access categories from their own business.
 *
 * @param category - The category document to check
 * @param businessId - The business ID to compare against
 * @returns True if category belongs to the business
 */
const isCategoryOwnedByBusiness = (category: Category, businessId: number): boolean => {
  const categoryBusinessId = extractBusinessId(category.business)
  return categoryBusinessId === businessId
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates category name
 *
 * Rules:
 * - Required (cannot be empty)
 * - Minimum 2 characters
 * - Maximum 100 characters
 *
 * @param name - Category name to validate
 * @returns Validation result with error message if invalid
 */
const validateCategoryName = (name: string | undefined): ValidationResult => {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Category name is required' }
  }
  if (name.length < 2) {
    return { valid: false, error: 'Category name must be at least 2 characters' }
  }
  if (name.length > 100) {
    return { valid: false, error: 'Category name must not exceed 100 characters' }
  }
  return { valid: true }
}

/**
 * Validates category code
 *
 * Rules:
 * - Optional (can be empty)
 * - Maximum 20 characters
 * - Must be alphanumeric (with underscores and hyphens allowed)
 *
 * @param code - Category code to validate
 * @returns Validation result with error message if invalid
 */
const validateCategoryCode = (code: string | undefined): ValidationResult => {
  if (code && code.length > 20) {
    return { valid: false, error: 'Category code must not exceed 20 characters' }
  }
  if (code && !/^[a-zA-Z0-9_-]*$/.test(code)) {
    return { valid: false, error: 'Category code must be alphanumeric (with _ and - allowed)' }
  }
  return { valid: true }
}

/**
 * Validates category description
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
 * Validates HSN (Harmonized System of Nomenclature) code
 *
 * Rules:
 * - Optional (can be empty)
 * - Maximum 10 characters
 *
 * @param hsn - HSN code to validate
 * @returns Validation result with error message if invalid
 */
const validateHsnCode = (hsn: string | undefined): ValidationResult => {
  if (hsn && hsn.length > 10) {
    return { valid: false, error: 'HSN code must not exceed 10 characters' }
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
 * Returns 404 Not Found response for missing category
 * Used when category doesn't exist or doesn't belong to user's business
 */
const categoryNotFoundResponse = () =>
  Response.json({ error: 'Category not found' }, { status: 404 })

/**
 * Returns 400 Bad Request response for missing category ID
 * Used when ID parameter is not provided
 */
const categoryIdRequiredResponse = () =>
  Response.json({ error: 'Category ID is required' }, { status: 400 })

// ============================================================================
// LIST CATEGORIES ENDPOINT
// ============================================================================

/**
 * List all categories for the current user's business
 *
 * @route GET /api/categories/list
 *
 * @queryParam {number} [page=1] - Page number for pagination
 * @queryParam {number} [limit=10] - Number of items per page (max: 100)
 * @queryParam {string} [search] - Search term to filter by category name
 * @queryParam {string} [sort=category_name] - Sort field (prefix with - for descending)
 * @queryParam {string} [parent] - Filter by parent category ID ('null' for root categories)
 *
 * @returns {Object} Paginated list of categories
 *
 * @example
 * // Request - Get root categories
 * GET /api/categories/list?parent=null
 *
 * // Request - Get children of category ID 5
 * GET /api/categories/list?parent=5
 *
 * // Response
 * {
 *   "success": true,
 *   "data": [{ "id": 1, "category_name": "Electronics", ... }],
 *   "totalDocs": 25,
 *   "totalPages": 3
 * }
 */
export const listCategories: PayloadHandler = async (req): Promise<Response> => {
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
    const url = new URL(req.url || '', 'http://localhost')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100)
    const search = url.searchParams.get('search') || ''
    const sort = url.searchParams.get('sort') || 'category_name'
    const parent = url.searchParams.get('parent')

    // ─────────────────────────────────────────────────────────────────────────
    // Step 4: Build Query Filter
    // ─────────────────────────────────────────────────────────────────────────
    const whereClause: Where = {
      // Multi-tenant filter: Only show categories for user's business
      business: { equals: businessId },
    }

    // Add optional search filter
    if (search) {
      whereClause.category_name = { contains: search }
    }

    // Filter by parent category
    if (parent === 'null' || parent === '') {
      // Get root categories (no parent)
      whereClause.parent_category = { exists: false }
    } else if (parent) {
      // Get children of specific parent
      whereClause.parent_category = { equals: parent }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Execute Query
    // ─────────────────────────────────────────────────────────────────────────
    const categories = await payload.find({
      collection: 'categories',
      where: whereClause,
      depth: 0,
      overrideAccess: true,
      page,
      limit,
      sort,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Step 6: Return Success Response
    // ─────────────────────────────────────────────────────────────────────────
    return Response.json({
      success: true,
      data: categories.docs.map(formatCategoryResponse),
      totalDocs: categories.totalDocs,
      totalPages: categories.totalPages,
      page: categories.page,
      limit: categories.limit,
      hasNextPage: categories.hasNextPage,
      hasPrevPage: categories.hasPrevPage,
    })
  } catch (error: unknown) {
    // ─────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────────────────────────────────
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories'
    console.error('List Categories Error:', error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

// ============================================================================
// GET CATEGORY TREE ENDPOINT
// ============================================================================

/**
 * Get hierarchical category tree for the current user's business
 *
 * This endpoint returns all categories organized in a tree structure
 * where each category has a `children` array containing its subcategories.
 *
 * @route GET /api/categories/tree
 *
 * @returns {Object} Category tree
 * @returns {boolean} success - Whether the request was successful
 * @returns {CategoryTreeNode[]} data - Array of root categories with children
 * @returns {number} totalCategories - Total number of categories
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "category_name": "Electronics",
 *       "children": [
 *         { "id": 2, "category_name": "Mobile Phones", "children": [] },
 *         { "id": 3, "category_name": "Laptops", "children": [] }
 *       ]
 *     }
 *   ],
 *   "totalCategories": 10
 * }
 */
export const getCategoryTree: PayloadHandler = async (req): Promise<Response> => {
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
    // Step 3: Fetch All Categories
    // ─────────────────────────────────────────────────────────────────────────
    const allCategories = await payload.find({
      collection: 'categories',
      where: {
        business: { equals: businessId },
      },
      depth: 0,
      overrideAccess: true,
      limit: 1000, // Get all categories (adjust if needed)
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Step 4: Build Tree Structure
    // ─────────────────────────────────────────────────────────────────────────
    // Create a map for quick lookup
    const categoryMap = new Map<number, CategoryTreeNode>()
    const rootCategories: CategoryTreeNode[] = []

    // First pass: Create map of all categories
    allCategories.docs.forEach((cat) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        category_name: cat.category_name,
        category_code: cat.category_code,
        description: cat.description,
        hsn_code: cat.hsn_code,
        parent_category: extractCategoryId(cat.parent_category),
        children: [],
      })
    })

    // Second pass: Build parent-child relationships
    allCategories.docs.forEach((cat) => {
      const current = categoryMap.get(cat.id)
      if (!current) return

      const parentId = extractCategoryId(cat.parent_category)

      if (parentId) {
        // Has parent - add to parent's children
        const parent = categoryMap.get(parentId)
        if (parent) {
          parent.children.push(current)
        } else {
          // Parent not found (orphan) - treat as root
          rootCategories.push(current)
        }
      } else {
        // No parent - this is a root category
        rootCategories.push(current)
      }
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Return Success Response
    // ─────────────────────────────────────────────────────────────────────────
    return Response.json({
      success: true,
      data: rootCategories,
      totalCategories: allCategories.totalDocs,
    })
  } catch (error: unknown) {
    // ─────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────────────────────────────────
    const errorMessage = error instanceof Error ? error.message : 'Failed to build category tree'
    console.error('Get Category Tree Error:', error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

// ============================================================================
// GET SINGLE CATEGORY ENDPOINT
// ============================================================================

/**
 * Get a single category by ID
 *
 * @route GET /api/categories/:id
 *
 * @param {string} id - Category ID (from URL path)
 *
 * @returns {Object} Category details
 *
 * @throws {401} If user is not authenticated
 * @throws {400} If category ID is not provided
 * @throws {404} If category not found or doesn't belong to user's business
 */
export const getCategory: PayloadHandler = async (req): Promise<Response> => {
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
    return categoryIdRequiredResponse()
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
    // Step 4: Fetch Category from Database
    // ─────────────────────────────────────────────────────────────────────────
    let category: Category | null = null
    try {
      category = await payload.findByID({
        collection: 'categories',
        id,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      // findByID throws NotFound error for invalid/non-existent IDs
      return categoryNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Ownership Verification
    // ─────────────────────────────────────────────────────────────────────────
    if (!category || !isCategoryOwnedByBusiness(category, businessId)) {
      return categoryNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 6: Return Success Response
    // ─────────────────────────────────────────────────────────────────────────
    return Response.json({
      success: true,
      data: formatCategoryResponse(category),
    })
  } catch (error: unknown) {
    // ─────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────────────────────────────────
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category'
    console.error('Get Category Error:', error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

// ============================================================================
// CREATE CATEGORY ENDPOINT
// ============================================================================

/**
 * Create a new category
 *
 * @route POST /api/categories/create
 *
 * @bodyParam {string} category_name - Category name (required, 2-100 chars)
 * @bodyParam {string} [category_code] - Category code (optional, max 20 chars, alphanumeric)
 * @bodyParam {string} [description] - Description (optional, max 500 chars)
 * @bodyParam {string} [hsn_code] - HSN code (optional, max 10 chars)
 * @bodyParam {number} [parent_category] - Parent category ID (optional)
 *
 * @returns {Object} Created category
 *
 * @throws {401} If user is not authenticated
 * @throws {400} If validation fails or parent category is invalid
 * @throws {404} If user has no business associated
 * @throws {409} If category with same name already exists
 *
 * @example
 * // Request
 * POST /api/categories/create
 * {
 *   "category_name": "Mobile Phones",
 *   "category_code": "MOB",
 *   "description": "All mobile phone products",
 *   "parent_category": 1
 * }
 */
export const createCategory: PayloadHandler = async (req): Promise<Response> => {
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
  const nameValidation = validateCategoryName(data.category_name)
  if (!nameValidation.valid) {
    return Response.json({ error: nameValidation.error }, { status: 400 })
  }

  const codeValidation = validateCategoryCode(data.category_code)
  if (!codeValidation.valid) {
    return Response.json({ error: codeValidation.error }, { status: 400 })
  }

  const descValidation = validateDescription(data.description)
  if (!descValidation.valid) {
    return Response.json({ error: descValidation.error }, { status: 400 })
  }

  const hsnValidation = validateHsnCode(data.hsn_code)
  if (!hsnValidation.valid) {
    return Response.json({ error: hsnValidation.error }, { status: 400 })
  }

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // Step 4: Check for Duplicate Category Name
    // ─────────────────────────────────────────────────────────────────────────
    const existingCategory = await payload.find({
      collection: 'categories',
      where: {
        business: { equals: businessId },
        category_name: { equals: data.category_name.trim() },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingCategory.totalDocs > 0) {
      return Response.json({ error: 'Category with this name already exists' }, { status: 409 })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Validate Parent Category (if provided)
    // ─────────────────────────────────────────────────────────────────────────
    if (data.parent_category) {
      try {
        const parentCat = await payload.findByID({
          collection: 'categories',
          id: data.parent_category,
          depth: 0,
          overrideAccess: true,
        })

        // Check if parent belongs to same business
        if (!isCategoryOwnedByBusiness(parentCat, businessId)) {
          return Response.json(
            { error: 'Parent category must belong to the same business' },
            { status: 400 },
          )
        }
      } catch {
        return Response.json(
          { error: `Parent category with ID "${data.parent_category}" not found` },
          { status: 400 },
        )
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 6: Create Category
    // ─────────────────────────────────────────────────────────────────────────
    const category = await payload.create({
      collection: 'categories',
      data: {
        category_name: data.category_name.trim(),
        category_code: data.category_code?.trim() || '',
        description: data.description?.trim() || '',
        hsn_code: data.hsn_code?.trim() || '',
        parent_category: data.parent_category || null,
        business: businessId,
      },
      overrideAccess: true,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Step 7: Return Success Response
    // ─────────────────────────────────────────────────────────────────────────
    return Response.json(
      {
        success: true,
        message: 'Category created successfully',
        data: formatCategoryResponse(category),
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    // ─────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────────────────────────────────
    const errorMessage = error instanceof Error ? error.message : 'Failed to create category'
    console.error('Create Category Error:', error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

// ============================================================================
// UPDATE CATEGORY ENDPOINT
// ============================================================================

/**
 * Update an existing category
 *
 * @route PATCH /api/categories/:id
 *
 * @param {string} id - Category ID (from URL path)
 *
 * @bodyParam {string} [category_name] - New category name (2-100 chars)
 * @bodyParam {string} [category_code] - New category code (max 20 chars)
 * @bodyParam {string} [description] - New description (max 500 chars)
 * @bodyParam {string} [hsn_code] - New HSN code (max 10 chars)
 * @bodyParam {number|null} [parent_category] - New parent ID (null to remove parent)
 *
 * @returns {Object} Updated category
 *
 * @throws {401} If user is not authenticated
 * @throws {400} If validation fails, self-referencing parent, or invalid parent
 * @throws {404} If category not found or doesn't belong to user's business
 * @throws {409} If new category name already exists
 */
export const updateCategory: PayloadHandler = async (req): Promise<Response> => {
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
    return categoryIdRequiredResponse()
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
  if (data.category_name !== undefined) {
    const nameValidation = validateCategoryName(data.category_name)
    if (!nameValidation.valid) {
      return Response.json({ error: nameValidation.error }, { status: 400 })
    }
  }

  if (data.category_code !== undefined) {
    const codeValidation = validateCategoryCode(data.category_code)
    if (!codeValidation.valid) {
      return Response.json({ error: codeValidation.error }, { status: 400 })
    }
  }

  if (data.description !== undefined) {
    const descValidation = validateDescription(data.description)
    if (!descValidation.valid) {
      return Response.json({ error: descValidation.error }, { status: 400 })
    }
  }

  if (data.hsn_code !== undefined) {
    const hsnValidation = validateHsnCode(data.hsn_code)
    if (!hsnValidation.valid) {
      return Response.json({ error: hsnValidation.error }, { status: 400 })
    }
  }

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Fetch Existing Category
    // ─────────────────────────────────────────────────────────────────────────
    let existingCategory: Category | null = null
    try {
      existingCategory = await payload.findByID({
        collection: 'categories',
        id,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      return categoryNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 6: Ownership Verification
    // ─────────────────────────────────────────────────────────────────────────
    if (!existingCategory || !isCategoryOwnedByBusiness(existingCategory, businessId)) {
      return categoryNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 7: Check for Duplicate Name (if name is being changed)
    // ─────────────────────────────────────────────────────────────────────────
    if (data.category_name && data.category_name.trim() !== existingCategory.category_name) {
      const duplicateCategory = await payload.find({
        collection: 'categories',
        where: {
          business: { equals: businessId },
          category_name: { equals: data.category_name.trim() },
          id: { not_equals: id },
        },
        limit: 1,
        overrideAccess: true,
      })

      if (duplicateCategory.totalDocs > 0) {
        return Response.json({ error: 'Category with this name already exists' }, { status: 409 })
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 8: Validate Parent Category (if being changed)
    // ─────────────────────────────────────────────────────────────────────────
    if (data.parent_category !== undefined) {
      // Empty string or null means remove parent
      if (data.parent_category === '' || data.parent_category === null) {
        data.parent_category = null
      } else {
        // Cannot set itself as parent (circular reference)
        if (String(data.parent_category) === String(id)) {
          return Response.json({ error: 'Category cannot be its own parent' }, { status: 400 })
        }

        // Validate parent exists and belongs to same business
        try {
          const parentCat = await payload.findByID({
            collection: 'categories',
            id: data.parent_category,
            depth: 0,
            overrideAccess: true,
          })

          if (!isCategoryOwnedByBusiness(parentCat, businessId)) {
            return Response.json(
              { error: 'Parent category must belong to the same business' },
              { status: 400 },
            )
          }
        } catch {
          return Response.json(
            { error: `Parent category with ID "${data.parent_category}" not found` },
            { status: 400 },
          )
        }
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 9: Prepare and Execute Update
    // ─────────────────────────────────────────────────────────────────────────
    const updateData: Partial<
      Pick<
        Category,
        'category_name' | 'category_code' | 'description' | 'hsn_code' | 'parent_category'
      >
    > = {}

    if (data.category_name !== undefined) updateData.category_name = data.category_name.trim()
    if (data.category_code !== undefined) updateData.category_code = data.category_code.trim()
    if (data.description !== undefined) updateData.description = data.description.trim()
    if (data.hsn_code !== undefined) updateData.hsn_code = data.hsn_code.trim()
    if (data.parent_category !== undefined) updateData.parent_category = data.parent_category

    const updatedCategory = await payload.update({
      collection: 'categories',
      id,
      data: updateData,
      overrideAccess: true,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Step 10: Return Success Response
    // ─────────────────────────────────────────────────────────────────────────
    return Response.json({
      success: true,
      message: 'Category updated successfully',
      data: formatCategoryResponse(updatedCategory),
    })
  } catch (error: unknown) {
    // ─────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────────────────────────────────
    const errorMessage = error instanceof Error ? error.message : 'Failed to update category'
    console.error('Update Category Error:', error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

// ============================================================================
// DELETE CATEGORY ENDPOINT
// ============================================================================

/**
 * Delete a category
 *
 * @route DELETE /api/categories/:id
 *
 * @param {string} id - Category ID (from URL path)
 *
 * @returns {Object} Success message
 *
 * @throws {401} If user is not authenticated
 * @throws {400} If category ID is not provided
 * @throws {404} If category not found or doesn't belong to user's business
 * @throws {409} If category has children or is linked to products
 *
 * @note Categories with child categories or linked products cannot be deleted.
 *       The children must be moved or deleted first, and products must be
 *       reassigned to a different category.
 */
export const deleteCategory: PayloadHandler = async (req): Promise<Response> => {
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
    return categoryIdRequiredResponse()
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
    // Step 4: Fetch Existing Category
    // ─────────────────────────────────────────────────────────────────────────
    let existingCategory: Category | null = null
    try {
      existingCategory = await payload.findByID({
        collection: 'categories',
        id,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      return categoryNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Ownership Verification
    // ─────────────────────────────────────────────────────────────────────────
    if (!existingCategory || !isCategoryOwnedByBusiness(existingCategory, businessId)) {
      return categoryNotFoundResponse()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 6: Check for Child Categories (Referential Integrity)
    // ─────────────────────────────────────────────────────────────────────────
    const childCategories = await payload.find({
      collection: 'categories',
      where: {
        parent_category: { equals: id },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (childCategories.totalDocs > 0) {
      return Response.json(
        {
          error: `Cannot delete category, it has ${childCategories.totalDocs} child category(ies). Move or delete them first.`,
        },
        { status: 409 },
      )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 7: Check for Linked Products (Referential Integrity)
    // ─────────────────────────────────────────────────────────────────────────
    const linkedProducts = await payload.find({
      collection: 'products',
      where: {
        category: { equals: id },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (linkedProducts.totalDocs > 0) {
      return Response.json(
        {
          error: `Cannot delete category, it is linked to ${linkedProducts.totalDocs} product(s). Reassign them first.`,
        },
        { status: 409 },
      )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 8: Delete Category
    // ─────────────────────────────────────────────────────────────────────────
    await payload.delete({
      collection: 'categories',
      id,
      overrideAccess: true,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Step 9: Return Success Response
    // ─────────────────────────────────────────────────────────────────────────
    return Response.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error: unknown) {
    // ─────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────────────────────────────────
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete category'
    console.error('Delete Category Error:', error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
