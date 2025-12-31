import { PayloadHandler } from 'payload'

// ==================== HELPER FUNCTIONS ====================

// Generate unique Contact ID
const generateContactId = async (
  payload: any,
  businessId: number,
  type: string,
): Promise<string> => {
  const prefix = type === 'supplier' ? 'SUP' : 'CUS'
  const lastContact = await payload.find({
    collection: 'contacts',
    where: {
      business: { equals: businessId },
      contact_type: { equals: type },
    },
    sort: '-created_at',
    limit: 1,
    overrideAccess: true,
  })

  // Simple increment logic (can be improved related to business settings later)
  let nextNum = 1
  if (lastContact.totalDocs > 0) {
    const lastId = lastContact.docs[0].contact_id
    const parts = lastId.split('-')
    if (parts.length > 1 && !isNaN(parseInt(parts[parts.length - 1]))) {
      nextNum = parseInt(parts[parts.length - 1]) + 1
    }
  }

  return `${prefix}-${String(nextNum).padStart(4, '0')}`
}

// Strip business details
const stripBusinessDetails = (doc: any): any => {
  if (!doc) return doc
  const result = { ...doc }
  if (result.business && typeof result.business === 'object') {
    result.business = result.business.id
  }
  return result
}

// ==================== LIST CONTACTS ====================

/**
 * GET /api/contacts/list
 * List contacts with filters
 */
export const listContacts: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!user.business) {
    return Response.json({ error: 'No business associated with user' }, { status: 404 })
  }

  const businessId = typeof user.business === 'object' ? user.business.id : user.business

  try {
    const url = new URL(req.url || '', 'http://localhost')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100)
    const type = url.searchParams.get('type') // 'customer' | 'supplier' | 'both'
    const search = url.searchParams.get('search')
    const status = url.searchParams.get('status') // 'active' | 'inactive'

    const whereClause: any = {
      business: { equals: businessId },
    }

    if (type && type !== 'both') {
      whereClause.contact_type = { equals: type }
    }

    if (status) {
      whereClause.is_active = { equals: status === 'active' }
    }

    if (search) {
      whereClause.or = [
        { first_name: { contains: search } },
        { last_name: { contains: search } },
        { mobile: { contains: search } },
        { contact_id: { contains: search } },
        { business_name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const contacts = await payload.find({
      collection: 'contacts',
      where: whereClause,
      depth: 0,
      overrideAccess: true,
      page,
      limit,
    })

    return Response.json({
      success: true,
      data: contacts.docs,
      totalDocs: contacts.totalDocs,
      totalPages: contacts.totalPages,
      page: contacts.page,
      limit: contacts.limit,
    })
  } catch (error: any) {
    console.error('List Contacts Error:', error)
    return Response.json({ error: error.message || 'Failed to list contacts' }, { status: 500 })
  }
}

// ==================== GET CONTACT ====================

/**
 * GET /api/contacts/:id
 * Get single contact details
 */
export const getContact: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user || (!user.business && !user.roles?.includes('admin'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const businessId =
    user.business && typeof user.business === 'object' ? user.business.id : user.business

  try {
    const contact = await payload.findByID({
      collection: 'contacts',
      id,
      overrideAccess: true,
    })

    if (!contact) {
      return Response.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Business validation
    if (!user.roles?.includes('admin') && (contact.business as any)?.id !== businessId) {
      return Response.json({ error: 'Contact not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: stripBusinessDetails(contact),
    })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to get contact' }, { status: 500 })
  }
}

// ==================== CREATE CONTACT ====================

/**
 * POST /api/contacts/create
 * Create a new contact
 */
export const createContact: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req
  const data = req.json ? await req.json() : {}

  if (!user || !user.business) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const businessId = typeof user.business === 'object' ? user.business.id : user.business

  // Basic Validation
  if (!data.first_name) {
    return Response.json({ error: 'First Name is required' }, { status: 400 })
  }

  const type = data.contact_type || 'customer'

  try {
    // Generate ID
    const contactId = await generateContactId(payload, businessId, type)

    // Check Mobile Uniqueness
    if (data.mobile) {
      const existing = await payload.find({
        collection: 'contacts',
        where: {
          business: { equals: businessId },
          mobile: { equals: data.mobile },
        },
        limit: 1,
        overrideAccess: true,
      })
      if (existing.totalDocs > 0) {
        return Response.json(
          { error: 'Mobile number already exists for another contact' },
          { status: 409 },
        )
      }
    }

    const contact = await payload.create({
      collection: 'contacts',
      data: {
        ...data,
        contact_id: contactId,
        contact_type: type,
        business: businessId,
        created_by: user.id,
      },
      overrideAccess: true,
    })

    return Response.json(
      {
        success: true,
        message: 'Contact created successfully',
        data: stripBusinessDetails(contact),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Create Contact Error:', error)
    return Response.json({ error: error.message || 'Failed to create contact' }, { status: 500 })
  }
}

// ==================== UPDATE CONTACT ====================

/**
 * PATCH /api/contacts/:id
 * Update contact details
 */
export const updateContact: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string
  const data = req.json ? await req.json() : {}

  if (!user || !user.business) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const businessId = typeof user.business === 'object' ? user.business.id : user.business

  try {
    const existingContact = await payload.findByID({
      collection: 'contacts',
      id,
      overrideAccess: true,
    })

    if (!existingContact || (existingContact.business as any)?.id !== businessId) {
      return Response.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Check Unique Mobile if changing
    if (data.mobile && data.mobile !== existingContact.mobile) {
      const checkMobile = await payload.find({
        collection: 'contacts',
        where: {
          business: { equals: businessId },
          mobile: { equals: data.mobile },
          id: { not_equals: id },
        },
        limit: 1,
        overrideAccess: true,
      })
      if (checkMobile.totalDocs > 0) {
        return Response.json(
          { error: 'Mobile number already used by another contact' },
          { status: 409 },
        )
      }
    }

    const updatedContact = await payload.update({
      collection: 'contacts',
      id,
      data: {
        ...data,
        // Prevent critical field updates via general update if needed
        contact_id: existingContact.contact_id,
        business: businessId,
      },
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Contact updated successfully',
      data: stripBusinessDetails(updatedContact),
    })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to update contact' }, { status: 500 })
  }
}

// ==================== DELETE CONTACT ====================

/**
 * DELETE /api/contacts/:id
 * Delete contact
 */
export const deleteContact: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!user || !user.business) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const businessId = typeof user.business === 'object' ? user.business.id : user.business

  try {
    const contact = await payload.findByID({
      collection: 'contacts',
      id,
      overrideAccess: true,
    })

    if (!contact || (contact.business as any)?.id !== businessId) {
      return Response.json({ error: 'Contact not found' }, { status: 404 })
    }

    // TODO: Check for Sales / Purchases dependencies
    // For now, if we delete a contact, their linked documents might have null references
    // Ideally, check 'sales', 'purchases' collections.

    await payload.delete({
      collection: 'contacts',
      id,
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      message: 'Contact deleted successfully',
    })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to delete contact' }, { status: 500 })
  }
}
