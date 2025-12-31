import { PayloadHandler } from 'payload'

// ==================== HELPER FUNCTIONS ====================

// Generate Lot Number if not provided
const generateLotNumber = (): string => {
  return `LOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

// Helper to strip business details
const stripBusinessDetails = (doc: any): any => {
  if (!doc) return doc
  const result = { ...doc }
  if (result.business && typeof result.business === 'object') {
    result.business = result.business.id
  }
  return result
}

// ==================== LIST STOCKS ====================

/**
 * GET /api/stocks/list
 * List stock entries with filters
 */
export const listStocks: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.business) {
    return Response.json({ error: 'No business associated with user' }, { status: 404 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Parse query params
    const url = new URL(req.url || '', 'http://localhost')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100)
    const locationId = url.searchParams.get('location_id')
    const productId = url.searchParams.get('product_id')
    const lowStock = url.searchParams.get('low_stock') === 'true'

    const whereClause: any = {
      business: { equals: businessId },
    }

    if (locationId) {
      whereClause.business_location = { equals: locationId }
    }

    if (productId) {
      whereClause.product = { equals: productId }
    }

    if (lowStock) {
      whereClause.stock = { less_than_equal: 5 } // Example threshold, can be dynamic
    }

    const stocks = await payload.find({
      collection: 'product-stock-price',
      where: whereClause,
      depth: 1,
      overrideAccess: true,
      page,
      limit,
    })

    const formattedDocs = stocks.docs.map((doc) => ({
      ...stripBusinessDetails(doc),
      product:
        doc.product && typeof doc.product === 'object'
          ? { id: doc.product.id, name: (doc.product as any).name }
          : doc.product,
      business_location:
        doc.business_location && typeof doc.business_location === 'object'
          ? { id: doc.business_location.id, name: (doc.business_location as any).name }
          : doc.business_location,
    }))

    return Response.json({
      success: true,
      data: formattedDocs,
      totalDocs: stocks.totalDocs,
      totalPages: stocks.totalPages,
      page: stocks.page,
      limit: stocks.limit,
    })
  } catch (error: any) {
    console.error('List Stocks Error:', error)
    return Response.json({ error: error.message || 'Failed to list stocks' }, { status: 500 })
  }
}

// ==================== ADD OPENING STOCK ====================

/**
 * POST /api/stocks/opening
 * Add opening stock / purchase entry
 */
/**
 * POST /api/stocks/opening
 * Add opening stock / purchase entry
 */
export const addOpeningStock: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  if (!user || !user.business) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const businessId = typeof user.business === 'object' ? user.business.id : user.business

  // Validate Required Fields
  if (!data.product || !data.business_location || data.stock === undefined) {
    return Response.json(
      { error: 'Product, Business Location, and Stock are required' },
      { status: 400 },
    )
  }

  // Validate Serials if provided
  if (data.serials && Array.isArray(data.serials)) {
    if (data.serials.length !== data.stock) {
      return Response.json(
        { error: `Mismatch: Provided ${data.serials.length} serials for ${data.stock} stock` },
        { status: 400 },
      )
    }

    // Check for duplicate serials in the payload
    const uniqueSerials = new Set(data.serials)
    if (uniqueSerials.size !== data.serials.length) {
      return Response.json({ error: 'Duplicate serial numbers in request' }, { status: 400 })
    }
  }

  try {
    // 1. Validate Product belongs to business
    const product = await payload.findByID({
      collection: 'products',
      id: data.product,
      overrideAccess: true,
    })
    if (!product || (product.business as any)?.id !== businessId) {
      return Response.json({ error: 'Invalid product for this business' }, { status: 400 })
    }

    // 2. Validate Location belongs to business
    const location = await payload.findByID({
      collection: 'business-locations',
      id: data.business_location,
      overrideAccess: true,
    })
    if (!location || (location.business as any)?.id !== businessId) {
      return Response.json({ error: 'Invalid location for this business' }, { status: 400 })
    }

    // 3. Validate Supplier if provided
    let supplierId = null
    if (data.supplier) {
      try {
        const supplier = await payload.findByID({
          collection: 'contacts',
          id: data.supplier,
          overrideAccess: true,
        })
        if (!supplier || (supplier.business as any)?.id !== businessId) {
          return Response.json({ error: 'Invalid supplier for this business' }, { status: 400 })
        }
        supplierId = supplier.id
      } catch {
        return Response.json({ error: 'Supplier not found' }, { status: 400 })
      }
    }

    // 4. Create Stock Entry
    const stockEntry = await payload.create({
      collection: 'product-stock-price',
      data: {
        business: businessId,
        product: data.product,
        business_location: data.business_location,
        stock: data.stock,
        unit_price: data.unit_price || 0,
        default_selling_price: data.default_selling_price || 0,
        lot_number: data.lot_number || generateLotNumber(),
        manufacturing_date: data.manufacturing_date || null,
        expiry_date: data.expiry_date || null,
        group_prices: data.group_prices || {}, // JSON field for group prices
        supplier: supplierId,
        status: 'active',
        created_by: user.id,
      },
      overrideAccess: true,
    })

    // 5. Create Serials if provided
    if (data.serials && Array.isArray(data.serials)) {
      const promises = data.serials.map((serial: string) =>
        payload.create({
          collection: 'product-imei-serial' as any,
          data: {
            product: data.product,
            stock_batch: stockEntry.id,
            serial_number: serial,
            status: 'available',
            business_location: data.business_location,
            supplier: supplierId,
            business: businessId,
            created_by: user.id,
          },
          overrideAccess: true,
        }),
      )

      await Promise.all(promises)
    }

    return Response.json(
      {
        success: true,
        message: 'Stock allocated successfully',
        data: stripBusinessDetails(stockEntry),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Add Stock Error:', error)
    return Response.json({ error: error.message || 'Failed to add stock' }, { status: 500 })
  }
}

// ==================== UPDATE PRICE & DETAILS ====================

/**
 * PATCH /api/stocks/:id/price
 * Update pricing and details for a stock batch
 */
export const updateStockPrice: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string
  const data = req.json ? await req.json() : {}

  if (!user || !user.business) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const businessId = typeof user.business === 'object' ? user.business.id : user.business

  try {
    // Verify stock entry belongs to business
    const stockEntry = await payload.findByID({
      collection: 'product-stock-price',
      id,
      overrideAccess: true,
    })

    if (!stockEntry || (stockEntry.business as any)?.id !== businessId) {
      return Response.json({ error: 'Stock entry not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (data.unit_price !== undefined) updateData.unit_price = data.unit_price
    if (data.default_selling_price !== undefined)
      updateData.default_selling_price = data.default_selling_price
    if (data.group_prices !== undefined) updateData.group_prices = data.group_prices
    if (data.stock !== undefined) updateData.stock = data.stock // Allow stock adjustment here or separate endpoint?

    const updatedStock = await payload.update({
      collection: 'product-stock-price',
      id,
      data: updateData,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Stock/Price updated successfully',
      data: stripBusinessDetails(updatedStock),
    })
  } catch (error: any) {
    console.error('Update Stock Price Error:', error)
    return Response.json({ error: error.message || 'Failed to update' }, { status: 500 })
  }
}

// ==================== DELETE STOCK ====================

/**
 * DELETE /api/stocks/:id
 * Delete stock entry if not used/sold
 */
export const deleteStock: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user || !user.business) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const businessId = typeof user.business === 'object' ? user.business.id : user.business

  try {
    const stockEntry = await payload.findByID({
      collection: 'product-stock-price',
      id,
      overrideAccess: true,
    })

    if (!stockEntry || (stockEntry.business as any)?.id !== businessId) {
      return Response.json({ error: 'Stock entry not found' }, { status: 404 })
    }

    if (stockEntry.sold && stockEntry.sold > 0) {
      return Response.json({ error: 'Cannot delete stock that has been sold' }, { status: 409 })
    }

    await payload.delete({
      collection: 'product-stock-price',
      id,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Stock entry deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete Stock Error:', error)
    return Response.json({ error: error.message || 'Failed to delete' }, { status: 500 })
  }
}
