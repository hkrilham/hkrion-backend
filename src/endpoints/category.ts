import { PayloadHandler } from 'payload'

// ==================== VALIDATION HELPERS ====================

const validateCategoryName = (name: string | undefined): { valid: boolean; error?: string } => {
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

const validateCategoryCode = (code: string | undefined): { valid: boolean; error?: string } => {
  if (code && code.length > 20) {
    return { valid: false, error: 'Category code must not exceed 20 characters' }
  }
  if (code && !/^[a-zA-Z0-9_-]*$/.test(code)) {
    return { valid: false, error: 'Category code must be alphanumeric' }
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

const validateHsnCode = (hsn: string | undefined): { valid: boolean; error?: string } => {
  if (hsn && hsn.length > 10) {
    return { valid: false, error: 'HSN code must not exceed 10 characters' }
  }
  return { valid: true }
}

// Helper to strip full business details from response
const stripBusinessDetails = (doc: any): any => {
  if (!doc) return doc
  const { business, parent_category, ...rest } = doc

  // Clean parent_category if it's an object
  let cleanParent = parent_category
  if (parent_category && typeof parent_category === 'object') {
    const { business: parentBusiness, ...parentRest } = parent_category
    cleanParent = {
      ...parentRest,
      business: typeof parentBusiness === 'object' ? parentBusiness?.id : parentBusiness,
    }
  }

  return {
    ...rest,
    business: typeof business === 'object' ? business?.id : business,
    parent_category: cleanParent,
  }
}

// ==================== LIST CATEGORIES ====================

/**
 * GET /api/categories/list
 * Returns all categories for the current user's business
 * Query params: page, limit, search, sort, parent
 */
export const listCategories: PayloadHandler = async (req): Promise<Response> => {
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
    const sort = url.searchParams.get('sort') || 'category_name'
    const parent = url.searchParams.get('parent')

    // Build where clause
    const whereClause: any = {
      business: { equals: businessId },
    }

    // Add search filter
    if (search) {
      whereClause.category_name = { contains: search }
    }

    // Filter by parent
    if (parent === 'null' || parent === '') {
      whereClause.parent_category = { exists: false }
    } else if (parent) {
      whereClause.parent_category = { equals: parent }
    }

    const categories = await payload.find({
      collection: 'categories',
      where: whereClause,
      depth: 0,
      overrideAccess: true,
      page,
      limit,
      sort,
    })

    return Response.json({
      success: true,
      data: categories.docs,
      totalDocs: categories.totalDocs,
      totalPages: categories.totalPages,
      page: categories.page,
      limit: categories.limit,
      hasNextPage: categories.hasNextPage,
      hasPrevPage: categories.hasPrevPage,
    })
  } catch (error: any) {
    console.error('List Categories Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 })
  }
}

// ==================== GET CATEGORY TREE ====================

/**
 * GET /api/categories/tree
 * Returns hierarchical category tree for the current user's business
 */
export const getCategoryTree: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Get all categories for this business
    const allCategories = await payload.find({
      collection: 'categories',
      where: {
        business: { equals: businessId },
      },
      depth: 0,
      overrideAccess: true,
      limit: 1000, // Get all categories
    })

    // Build tree structure
    const categoryMap = new Map<string | number, any>()
    const rootCategories: any[] = []

    // First pass: create map of all categories
    allCategories.docs.forEach((cat: any) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        category_name: cat.category_name,
        category_code: cat.category_code,
        description: cat.description,
        hsn_code: cat.hsn_code,
        parent_category: cat.parent_category,
        children: [],
      })
    })

    // Second pass: build tree
    allCategories.docs.forEach((cat: any) => {
      const current = categoryMap.get(cat.id)
      if (cat.parent_category) {
        const parentId =
          typeof cat.parent_category === 'object' ? cat.parent_category.id : cat.parent_category
        const parent = categoryMap.get(parentId)
        if (parent) {
          parent.children.push(current)
        } else {
          rootCategories.push(current)
        }
      } else {
        rootCategories.push(current)
      }
    })

    return Response.json({
      success: true,
      data: rootCategories,
      totalCategories: allCategories.totalDocs,
    })
  } catch (error: any) {
    console.error('Get Category Tree Error:', error)
    return Response.json(
      { error: error.message || 'Failed to build category tree' },
      { status: 500 },
    )
  }
}

// ==================== GET CATEGORY ====================

/**
 * GET /api/categories/:id
 * Returns a single category by ID
 */
export const getCategory: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Category ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const category = await payload.findByID({
      collection: 'categories',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category belongs to user's business
    const catBusiness = category.business
    if (!catBusiness) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }
    const catBusinessId = typeof catBusiness === 'object' ? catBusiness.id : catBusiness
    if (catBusinessId !== businessId) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: category,
    })
  } catch (error: any) {
    console.error('Get Category Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch category' }, { status: 500 })
  }
}

// ==================== CREATE CATEGORY ====================

/**
 * POST /api/categories/create
 * Creates a new category
 */
export const createCategory: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  // Validate category_name
  const nameValidation = validateCategoryName(data.category_name)
  if (!nameValidation.valid) {
    return Response.json({ error: nameValidation.error }, { status: 400 })
  }

  // Validate category_code
  const codeValidation = validateCategoryCode(data.category_code)
  if (!codeValidation.valid) {
    return Response.json({ error: codeValidation.error }, { status: 400 })
  }

  // Validate description
  const descValidation = validateDescription(data.description)
  if (!descValidation.valid) {
    return Response.json({ error: descValidation.error }, { status: 400 })
  }

  // Validate hsn_code
  const hsnValidation = validateHsnCode(data.hsn_code)
  if (!hsnValidation.valid) {
    return Response.json({ error: hsnValidation.error }, { status: 400 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if category name already exists for this business
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

    // Validate parent_category belongs to same business
    if (data.parent_category) {
      try {
        const parentCat = await payload.findByID({
          collection: 'categories',
          id: data.parent_category,
          depth: 0,
          overrideAccess: true,
        })

        if (!parentCat) {
          return Response.json(
            { error: `Parent category with ID "${data.parent_category}" not found` },
            { status: 400 },
          )
        }

        const parentBusiness = parentCat.business
        const parentBusinessId =
          typeof parentBusiness === 'object' ? parentBusiness?.id : parentBusiness
        if (parentBusinessId !== businessId) {
          return Response.json(
            { error: 'Parent category must belong to the same business' },
            { status: 400 },
          )
        }
      } catch (err) {
        return Response.json(
          { error: `Invalid parent_category ID: "${data.parent_category}". Category not found.` },
          { status: 400 },
        )
      }
    }

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

    return Response.json(
      {
        success: true,
        message: 'Category created successfully',
        data: stripBusinessDetails(category),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Create Category Error:', error)
    return Response.json({ error: error.message || 'Failed to create category' }, { status: 500 })
  }
}

// ==================== UPDATE CATEGORY ====================

/**
 * PATCH /api/categories/:id
 * Updates a category
 */
export const updateCategory: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Category ID is required' }, { status: 400 })
  }

  // Validate fields if provided
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
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if category exists and belongs to user's business
    const existingCategory = await payload.findByID({
      collection: 'categories',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingCategory) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }

    const existingCatBusiness = existingCategory.business
    if (!existingCatBusiness) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }
    const catBusinessId =
      typeof existingCatBusiness === 'object' ? existingCatBusiness.id : existingCatBusiness
    if (catBusinessId !== businessId) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if new category name already exists
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

    // Validate parent_category
    // Empty string means remove parent (set to null)
    if (data.parent_category !== undefined) {
      // Empty string or null means remove parent
      if (data.parent_category === '' || data.parent_category === null) {
        data.parent_category = null
      } else {
        // Cannot set itself as parent
        if (data.parent_category === id) {
          return Response.json({ error: 'Category cannot be its own parent' }, { status: 400 })
        }

        try {
          const parentCat = await payload.findByID({
            collection: 'categories',
            id: data.parent_category,
            depth: 0,
            overrideAccess: true,
          })

          if (!parentCat) {
            return Response.json({ error: 'Parent category not found' }, { status: 400 })
          }

          const parentBusiness = parentCat.business
          const parentBusinessId =
            typeof parentBusiness === 'object' ? parentBusiness?.id : parentBusiness
          if (parentBusinessId !== businessId) {
            return Response.json(
              { error: 'Parent category must belong to the same business' },
              { status: 400 },
            )
          }
        } catch (err) {
          return Response.json(
            { error: `Invalid parent_category ID: "${data.parent_category}"` },
            { status: 400 },
          )
        }
      }
    }

    // Prepare update data
    const updateData: any = {}
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

    return Response.json({
      success: true,
      message: 'Category updated successfully',
      data: stripBusinessDetails(updatedCategory),
    })
  } catch (error: any) {
    console.error('Update Category Error:', error)
    return Response.json({ error: error.message || 'Failed to update category' }, { status: 500 })
  }
}

// ==================== DELETE CATEGORY ====================

/**
 * DELETE /api/categories/:id
 * Deletes a category
 */
export const deleteCategory: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Category ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if category exists and belongs to user's business
    const existingCategory = await payload.findByID({
      collection: 'categories',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingCategory) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }

    const existingCatBusiness = existingCategory.business
    if (!existingCatBusiness) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }
    const catBusinessId =
      typeof existingCatBusiness === 'object' ? existingCatBusiness.id : existingCatBusiness
    if (catBusinessId !== businessId) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category has children
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
          error: `Cannot delete category, it has ${childCategories.totalDocs} child category(ies)`,
        },
        { status: 409 },
      )
    }

    // Check if category is linked to any products
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
          error: `Cannot delete category, it is linked to ${linkedProducts.totalDocs} product(s)`,
        },
        { status: 409 },
      )
    }

    await payload.delete({
      collection: 'categories',
      id,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete Category Error:', error)
    return Response.json({ error: error.message || 'Failed to delete category' }, { status: 500 })
  }
}
