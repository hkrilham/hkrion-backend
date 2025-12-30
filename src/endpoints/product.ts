import { PayloadHandler } from 'payload'

// ==================== HELPER FUNCTIONS ====================

// Generate unique SKU
const generateSKU = (businessId: number): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PRD-${businessId}-${timestamp}-${random}`
}

// ==================== VALIDATION HELPERS ====================

const validateProductName = (name: string | undefined): { valid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Product name is required' }
  }
  if (name.length < 2) {
    return { valid: false, error: 'Product name must be at least 2 characters' }
  }
  if (name.length > 200) {
    return { valid: false, error: 'Product name must not exceed 200 characters' }
  }
  return { valid: true }
}

const validateDescription = (
  description: string | undefined,
): { valid: boolean; error?: string } => {
  if (description && description.length > 2000) {
    return { valid: false, error: 'Description must not exceed 2000 characters' }
  }
  return { valid: true }
}

const validateAlertQuantity = (qty: number | undefined): { valid: boolean; error?: string } => {
  if (qty !== undefined && qty !== null) {
    if (typeof qty !== 'number' || qty < 0) {
      return { valid: false, error: 'Alert quantity must be a non-negative number' }
    }
  }
  return { valid: true }
}

// Helper to strip full business details from response
const stripBusinessDetails = (doc: any): any => {
  if (!doc) return doc
  const result = { ...doc }

  // Strip business
  if (result.business && typeof result.business === 'object') {
    result.business = result.business.id
  }

  return result
}

// ==================== LIST PRODUCTS ====================

/**
 * GET /api/products/list
 * Returns all products for the current user's business
 */
export const listProducts: PayloadHandler = async (req): Promise<Response> => {
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
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')
    const brand = url.searchParams.get('brand')
    const unit = url.searchParams.get('unit')

    // Build where clause
    const whereClause: any = {
      business: { equals: businessId },
    }

    // Add search filter
    if (search) {
      whereClause.or = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Status filter
    if (status && ['active', 'inactive'].includes(status)) {
      whereClause.status = { equals: status }
    }

    // Category filter
    if (category) {
      whereClause.category = { equals: category }
    }

    // Brand filter
    if (brand) {
      whereClause.brand = { equals: brand }
    }

    // Unit filter
    if (unit) {
      whereClause.units = { equals: unit }
    }

    const products = await payload.find({
      collection: 'products',
      where: whereClause,
      depth: 1, // Include category, brand names
      overrideAccess: true,
      page,
      limit,
      sort,
    })

    // Format response
    const formattedDocs = products.docs.map((doc) => ({
      id: doc.id,
      name: doc.name,
      sku: doc.sku,
      status: doc.status,
      image_url: doc.image_url,
      category: doc.category
        ? {
            id: typeof doc.category === 'object' ? doc.category.id : doc.category,
            name: (doc.category as any)?.name,
          }
        : null,
      brand: doc.brand
        ? {
            id: typeof doc.brand === 'object' ? doc.brand.id : doc.brand,
            name: (doc.brand as any)?.name,
          }
        : null,
      units: doc.units
        ? {
            id: typeof doc.units === 'object' ? doc.units.id : doc.units,
            short_name: (doc.units as any)?.short_name,
          }
        : null,
      manage_stock: doc.manage_stock,
      alert_quantity: doc.alert_quantity,
    }))

    return Response.json({
      success: true,
      data: formattedDocs,
      totalDocs: products.totalDocs,
      totalPages: products.totalPages,
      page: products.page,
      limit: products.limit,
      hasNextPage: products.hasNextPage,
      hasPrevPage: products.hasPrevPage,
    })
  } catch (error: any) {
    console.error('List Products Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch products' }, { status: 500 })
  }
}

// ==================== GET PRODUCT ====================

/**
 * GET /api/products/:id
 * Returns a single product by ID with full details
 */
export const getProduct: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Product ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const product = await payload.findByID({
      collection: 'products',
      id,
      depth: 1,
      overrideAccess: true,
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product belongs to user's business
    const productBusiness = product.business
    if (!productBusiness) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }
    const productBusinessId =
      typeof productBusiness === 'object' ? productBusiness.id : productBusiness
    if (productBusinessId !== businessId) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: stripBusinessDetails(product),
    })
  } catch (error: any) {
    console.error('Get Product Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch product' }, { status: 500 })
  }
}

// ==================== CREATE PRODUCT ====================

/**
 * POST /api/products/create
 * Creates a new product
 */
export const createProduct: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  // Validate name
  const nameValidation = validateProductName(data.name)
  if (!nameValidation.valid) {
    return Response.json({ error: nameValidation.error }, { status: 400 })
  }

  // Validate description
  const descValidation = validateDescription(data.description)
  if (!descValidation.valid) {
    return Response.json({ error: descValidation.error }, { status: 400 })
  }

  // Validate alert_quantity
  const alertValidation = validateAlertQuantity(data.alert_quantity)
  if (!alertValidation.valid) {
    return Response.json({ error: alertValidation.error }, { status: 400 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if product name already exists for this business
    const existingProduct = await payload.find({
      collection: 'products',
      where: {
        business: { equals: businessId },
        name: { equals: data.name.trim() },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingProduct.totalDocs > 0) {
      return Response.json({ error: 'Product with this name already exists' }, { status: 409 })
    }

    // Generate or validate SKU
    let sku = data.sku?.trim()
    if (!sku) {
      // Auto-generate SKU
      sku = generateSKU(businessId)
    } else {
      // Check if SKU is unique
      const existingSKU = await payload.find({
        collection: 'products',
        where: {
          business: { equals: businessId },
          sku: { equals: sku },
        },
        limit: 1,
        overrideAccess: true,
      })

      if (existingSKU.totalDocs > 0) {
        return Response.json({ error: 'Product with this SKU already exists' }, { status: 409 })
      }
    }

    // Validate related entities belong to same business
    if (data.category) {
      try {
        const category = await payload.findByID({
          collection: 'categories',
          id: data.category,
          overrideAccess: true,
        })
        const catBusiness = category?.business
        const catBusinessId = typeof catBusiness === 'object' ? catBusiness?.id : catBusiness
        if (catBusinessId !== businessId) {
          return Response.json(
            { error: 'Category does not belong to your business' },
            { status: 400 },
          )
        }
      } catch {
        return Response.json({ error: 'Category not found' }, { status: 400 })
      }
    }

    if (data.brand) {
      try {
        const brand = await payload.findByID({
          collection: 'brands',
          id: data.brand,
          overrideAccess: true,
        })
        const brandBusiness = brand?.business
        const brandBusinessId =
          typeof brandBusiness === 'object' ? brandBusiness?.id : brandBusiness
        if (brandBusinessId !== businessId) {
          return Response.json({ error: 'Brand does not belong to your business' }, { status: 400 })
        }
      } catch {
        return Response.json({ error: 'Brand not found' }, { status: 400 })
      }
    }

    if (data.units) {
      try {
        const unit = await payload.findByID({
          collection: 'units',
          id: data.units,
          overrideAccess: true,
        })
        const unitBusiness = unit?.business
        const unitBusinessId = typeof unitBusiness === 'object' ? unitBusiness?.id : unitBusiness
        if (unitBusinessId !== businessId) {
          return Response.json({ error: 'Unit does not belong to your business' }, { status: 400 })
        }
      } catch {
        return Response.json({ error: 'Unit not found' }, { status: 400 })
      }
    }

    if (data.warranties) {
      try {
        const warranty = await payload.findByID({
          collection: 'warranties',
          id: data.warranties,
          overrideAccess: true,
        })
        const warrantyBusiness = warranty?.business
        const warrantyBusinessId =
          typeof warrantyBusiness === 'object' ? warrantyBusiness?.id : warrantyBusiness
        if (warrantyBusinessId !== businessId) {
          return Response.json(
            { error: 'Warranty does not belong to your business' },
            { status: 400 },
          )
        }
      } catch {
        return Response.json({ error: 'Warranty not found' }, { status: 400 })
      }
    }

    const product = await payload.create({
      collection: 'products',
      data: {
        name: data.name.trim(),
        sku,
        description: data.description?.trim() || '',
        image_url: data.image_url || '',
        barcode_type: data.barcode_type || '',
        status: data.status || 'active',
        is_serial_imei: data.is_serial_imei || false,
        units: data.units || null,
        warranties: data.warranties || null,
        brand: data.brand || null,
        category: data.category || null,
        manage_stock: data.manage_stock !== false,
        alert_quantity: data.alert_quantity || 0,
        expiry_date: data.expiry_date || false,
        business: businessId,
      },
      overrideAccess: true,
    })

    return Response.json(
      {
        success: true,
        message: 'Product created successfully',
        data: stripBusinessDetails(product),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Create Product Error:', error)
    return Response.json({ error: error.message || 'Failed to create product' }, { status: 500 })
  }
}

// ==================== UPDATE PRODUCT ====================

/**
 * PATCH /api/products/:id
 * Updates a product
 */
export const updateProduct: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string
  const data = req.json ? await req.json() : {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Product ID is required' }, { status: 400 })
  }

  // Validate fields if provided
  if (data.name !== undefined) {
    const nameValidation = validateProductName(data.name)
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

  if (data.alert_quantity !== undefined) {
    const alertValidation = validateAlertQuantity(data.alert_quantity)
    if (!alertValidation.valid) {
      return Response.json({ error: alertValidation.error }, { status: 400 })
    }
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if product exists and belongs to user's business
    const existingProduct = await payload.findByID({
      collection: 'products',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingProduct) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    const existingProductBusiness = existingProduct.business
    if (!existingProductBusiness) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }
    const productBusinessId =
      typeof existingProductBusiness === 'object'
        ? existingProductBusiness.id
        : existingProductBusiness
    if (productBusinessId !== businessId) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check for duplicate name
    if (data.name && data.name.trim() !== existingProduct.name) {
      const duplicateProduct = await payload.find({
        collection: 'products',
        where: {
          business: { equals: businessId },
          name: { equals: data.name.trim() },
          id: { not_equals: id },
        },
        limit: 1,
        overrideAccess: true,
      })

      if (duplicateProduct.totalDocs > 0) {
        return Response.json({ error: 'Product with this name already exists' }, { status: 409 })
      }
    }

    // Check for duplicate SKU
    if (data.sku && data.sku.trim() !== existingProduct.sku) {
      const duplicateSKU = await payload.find({
        collection: 'products',
        where: {
          business: { equals: businessId },
          sku: { equals: data.sku.trim() },
          id: { not_equals: id },
        },
        limit: 1,
        overrideAccess: true,
      })

      if (duplicateSKU.totalDocs > 0) {
        return Response.json({ error: 'Product with this SKU already exists' }, { status: 409 })
      }
    }

    // Validate related entities
    if (data.category) {
      try {
        const category = await payload.findByID({
          collection: 'categories',
          id: data.category,
          overrideAccess: true,
        })
        const catBusiness = category?.business
        const catBusinessId = typeof catBusiness === 'object' ? catBusiness?.id : catBusiness
        if (catBusinessId !== businessId) {
          return Response.json(
            { error: 'Category does not belong to your business' },
            { status: 400 },
          )
        }
      } catch {
        return Response.json({ error: 'Category not found' }, { status: 400 })
      }
    }

    if (data.brand) {
      try {
        const brand = await payload.findByID({
          collection: 'brands',
          id: data.brand,
          overrideAccess: true,
        })
        const brandBusiness = brand?.business
        const brandBusinessId =
          typeof brandBusiness === 'object' ? brandBusiness?.id : brandBusiness
        if (brandBusinessId !== businessId) {
          return Response.json({ error: 'Brand does not belong to your business' }, { status: 400 })
        }
      } catch {
        return Response.json({ error: 'Brand not found' }, { status: 400 })
      }
    }

    if (data.units) {
      try {
        const unit = await payload.findByID({
          collection: 'units',
          id: data.units,
          overrideAccess: true,
        })
        const unitBusiness = unit?.business
        const unitBusinessId = typeof unitBusiness === 'object' ? unitBusiness?.id : unitBusiness
        if (unitBusinessId !== businessId) {
          return Response.json({ error: 'Unit does not belong to your business' }, { status: 400 })
        }
      } catch {
        return Response.json({ error: 'Unit not found' }, { status: 400 })
      }
    }

    if (data.warranties) {
      try {
        const warranty = await payload.findByID({
          collection: 'warranties',
          id: data.warranties,
          overrideAccess: true,
        })
        const warrantyBusiness = warranty?.business
        const warrantyBusinessId =
          typeof warrantyBusiness === 'object' ? warrantyBusiness?.id : warrantyBusiness
        if (warrantyBusinessId !== businessId) {
          return Response.json(
            { error: 'Warranty does not belong to your business' },
            { status: 400 },
          )
        }
      } catch {
        return Response.json({ error: 'Warranty not found' }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.sku !== undefined) updateData.sku = data.sku.trim()
    if (data.description !== undefined) updateData.description = data.description.trim()
    if (data.image_url !== undefined) updateData.image_url = data.image_url
    if (data.barcode_type !== undefined) updateData.barcode_type = data.barcode_type
    if (data.status !== undefined) updateData.status = data.status
    if (data.is_serial_imei !== undefined) updateData.is_serial_imei = data.is_serial_imei
    if (data.units !== undefined) updateData.units = data.units || null
    if (data.warranties !== undefined) updateData.warranties = data.warranties || null
    if (data.brand !== undefined) updateData.brand = data.brand || null
    if (data.category !== undefined) updateData.category = data.category || null
    if (data.manage_stock !== undefined) updateData.manage_stock = data.manage_stock
    if (data.alert_quantity !== undefined) updateData.alert_quantity = data.alert_quantity
    if (data.expiry_date !== undefined) updateData.expiry_date = data.expiry_date

    const updatedProduct = await payload.update({
      collection: 'products',
      id,
      data: updateData,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Product updated successfully',
      data: stripBusinessDetails(updatedProduct),
    })
  } catch (error: any) {
    console.error('Update Product Error:', error)
    return Response.json({ error: error.message || 'Failed to update product' }, { status: 500 })
  }
}

// ==================== DELETE PRODUCT ====================

/**
 * DELETE /api/products/:id
 * Deletes a product
 */
export const deleteProduct: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ error: 'Product ID is required' }, { status: 400 })
  }

  try {
    if (!user.business) {
      return Response.json({ error: 'No business associated with this user' }, { status: 404 })
    }
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Check if product exists and belongs to user's business
    const existingProduct = await payload.findByID({
      collection: 'products',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!existingProduct) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    const existingProductBusiness = existingProduct.business
    if (!existingProductBusiness) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }
    const productBusinessId =
      typeof existingProductBusiness === 'object'
        ? existingProductBusiness.id
        : existingProductBusiness
    if (productBusinessId !== businessId) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product is linked to sales
    const linkedSales = await payload.find({
      collection: 'sale-items',
      where: {
        product: { equals: id },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (linkedSales.totalDocs > 0) {
      return Response.json(
        { error: 'Cannot delete product, it has sales history' },
        { status: 409 },
      )
    }

    // Check if product is linked to purchases
    const linkedPurchases = await payload.find({
      collection: 'purchase-items',
      where: {
        product: { equals: id },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (linkedPurchases.totalDocs > 0) {
      return Response.json(
        { error: 'Cannot delete product, it has purchase history' },
        { status: 409 },
      )
    }

    await payload.delete({
      collection: 'products',
      id,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete Product Error:', error)
    return Response.json({ error: error.message || 'Failed to delete product' }, { status: 500 })
  }
}
