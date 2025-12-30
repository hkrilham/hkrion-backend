import { PayloadHandler } from 'payload'

/**
 * GET /api/businesses/me
 * Returns the current user's business details
 */
export const getMyBusiness: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  // Check if user is authenticated
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user has a business
  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    const business = await payload.findByID({
      collection: 'businesses',
      id: businessId,
      overrideAccess: true,
    })

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: business,
    })
  } catch (error: any) {
    console.error('Get Business Error:', error)
    return Response.json({ error: error.message || 'Failed to fetch business' }, { status: 500 })
  }
}

/**
 * PATCH /api/businesses/me
 * Updates the current user's business details
 */
export const updateMyBusiness: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  // Check if user is authenticated
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user has a business
  if (!user.business) {
    return Response.json({ error: 'No business associated with this user' }, { status: 404 })
  }

  try {
    const businessId = typeof user.business === 'object' ? user.business.id : user.business

    // Remove fields that shouldn't be updated via API
    const { id, createdAt, updatedAt, ...updateData } = data

    const updatedBusiness = await payload.update({
      collection: 'businesses',
      id: businessId,
      data: updateData,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Business updated successfully',
      data: updatedBusiness,
    })
  } catch (error: any) {
    console.error('Update Business Error:', error)
    return Response.json({ error: error.message || 'Failed to update business' }, { status: 500 })
  }
}
