import { PayloadHandler } from 'payload'

// Type for unit group
type UnitGroup = 'MASS' | 'LENGTH' | 'VOLUME' | 'AREA' | 'COUNT' | 'TIME' | 'OTHER'

// ==================== VALIDATION HELPERS ====================

/**
 * Validate password strength
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  return { valid: true }
}

/**
 * Validate email format
 */
const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }
  return { valid: true }
}

/**
 * Validate business name
 */
const validateBusinessName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Business name must be at least 2 characters' }
  }
  if (name.length > 100) {
    return { valid: false, error: 'Business name must not exceed 100 characters' }
  }
  return { valid: true }
}

// ==================== REGISTER BUSINESS ====================

export const registerBusiness: PayloadHandler = async (req): Promise<Response> => {
  const { payload } = req
  const data = req.json ? await req.json() : {}

  // Basic Validation
  if (!data.businessName || !data.email || !data.password || !data.country || !data.city) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate business name
  const businessNameValidation = validateBusinessName(data.businessName)
  if (!businessNameValidation.valid) {
    return Response.json({ error: businessNameValidation.error }, { status: 400 })
  }

  // Validate email format
  const emailValidation = validateEmail(data.email)
  if (!emailValidation.valid) {
    return Response.json({ error: emailValidation.error }, { status: 400 })
  }

  // Validate password strength
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.valid) {
    return Response.json({ error: passwordValidation.error }, { status: 400 })
  }

  try {
    // Check if email already exists
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: { equals: data.email.toLowerCase().trim() },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingUser.totalDocs > 0) {
      return Response.json(
        {
          error:
            'An account with this email already exists. Please login or use a different email.',
        },
        { status: 409 },
      )
    }

    // 1. Create Business
    const business = await payload.create({
      collection: 'businesses',
      data: {
        business_name: data.businessName,
        country: data.country,
        city: data.city,
        state: data.state || 'Unknown',
        zip_code: data.zipCode || '000000',
        landmark: data.landmark || 'N/A',
        currency: data.currency || 'USD',
        timezone: data.timezone || 'Asia/Kolkata',
        financial_year_start: 'January',
        stock_accounting_method: 'FIFO (First In First Out)',
        start_date: new Date().toISOString(),
      },
      overrideAccess: true,
    })

    // 2. Create Admin User
    const user = await payload.create({
      collection: 'users',
      data: {
        email: data.email,
        password: data.password,
        business: business.id,
        roles: ['admin'],
      },
    })

    // 3. Create User Profile
    try {
      await payload.create({
        collection: 'user-profiles',
        data: {
          username: data.email.split('@')[0] + '_' + Date.now(),
          first_name: data.firstName || 'Admin',
          email: data.email,
          business: business.id,
        },
      })
    } catch (profileError) {
      console.error('Profile creation failed', profileError)
      // Continue even if profile creation fails, as core user exists
    }

    // 4. Create Default Units
    try {
      console.log(`Creating default units for business: ${business.id}`)

      const defaultUnits: {
        name: string
        short_name: string
        unit_group: UnitGroup
        is_base_unit: boolean
        allow_decimal: boolean
      }[] = [
        // COUNT units
        {
          name: 'Pieces',
          short_name: 'pcs',
          unit_group: 'COUNT',
          is_base_unit: true,
          allow_decimal: false,
        },
        {
          name: 'Box',
          short_name: 'box',
          unit_group: 'COUNT',
          is_base_unit: false,
          allow_decimal: false,
        },
        {
          name: 'Dozen',
          short_name: 'dz',
          unit_group: 'COUNT',
          is_base_unit: false,
          allow_decimal: false,
        },
        {
          name: 'Pack',
          short_name: 'pack',
          unit_group: 'COUNT',
          is_base_unit: false,
          allow_decimal: false,
        },

        // MASS units
        {
          name: 'Kilogram',
          short_name: 'kg',
          unit_group: 'MASS',
          is_base_unit: true,
          allow_decimal: true,
        },
        {
          name: 'Gram',
          short_name: 'g',
          unit_group: 'MASS',
          is_base_unit: false,
          allow_decimal: false,
        },
        {
          name: 'Milligram',
          short_name: 'mg',
          unit_group: 'MASS',
          is_base_unit: false,
          allow_decimal: false,
        },

        // VOLUME units
        {
          name: 'Liter',
          short_name: 'L',
          unit_group: 'VOLUME',
          is_base_unit: true,
          allow_decimal: true,
        },
        {
          name: 'Milliliter',
          short_name: 'mL',
          unit_group: 'VOLUME',
          is_base_unit: false,
          allow_decimal: false,
        },

        // LENGTH units
        {
          name: 'Meter',
          short_name: 'm',
          unit_group: 'LENGTH',
          is_base_unit: true,
          allow_decimal: true,
        },
        {
          name: 'Centimeter',
          short_name: 'cm',
          unit_group: 'LENGTH',
          is_base_unit: false,
          allow_decimal: false,
        },
        {
          name: 'Millimeter',
          short_name: 'mm',
          unit_group: 'LENGTH',
          is_base_unit: false,
          allow_decimal: false,
        },
      ]

      const createdUnits: Record<string, number> = {}

      for (const unitData of defaultUnits) {
        const unit = await payload.create({
          collection: 'units',
          data: {
            ...unitData,
            business: business.id,
          },
          overrideAccess: true,
        })
        createdUnits[unitData.short_name] = unit.id as number
      }

      // Create default conversions
      const defaultConversions = [
        { from: 'kg', to: 'g', factor: 1000 },
        { from: 'g', to: 'kg', factor: 0.001 },
        { from: 'kg', to: 'mg', factor: 1000000 },
        { from: 'mg', to: 'kg', factor: 0.000001 },
        { from: 'g', to: 'mg', factor: 1000 },
        { from: 'mg', to: 'g', factor: 0.001 },
        { from: 'L', to: 'mL', factor: 1000 },
        { from: 'mL', to: 'L', factor: 0.001 },
        { from: 'm', to: 'cm', factor: 100 },
        { from: 'cm', to: 'm', factor: 0.01 },
        { from: 'm', to: 'mm', factor: 1000 },
        { from: 'mm', to: 'm', factor: 0.001 },
        { from: 'cm', to: 'mm', factor: 10 },
        { from: 'mm', to: 'cm', factor: 0.1 },
        { from: 'dz', to: 'pcs', factor: 12 },
        { from: 'pcs', to: 'dz', factor: 1 / 12 },
      ]

      for (const conv of defaultConversions) {
        const fromUnitId = createdUnits[conv.from]
        const toUnitId = createdUnits[conv.to]

        if (fromUnitId && toUnitId) {
          await payload.create({
            collection: 'unit_conversions',
            data: {
              from_unit: fromUnitId,
              to_unit: toUnitId,
              factor: conv.factor,
              business: business.id,
            },
            overrideAccess: true,
          })
        }
      }

      console.log(`Default units created for business: ${business.id}`)
    } catch (unitsError) {
      console.error('Default units creation failed:', unitsError)
      // Continue even if units creation fails
    }

    // 5. Create Default Location
    try {
      console.log(`Creating default location for business: ${business.id}`)

      await payload.create({
        collection: 'business-locations',
        data: {
          name: 'Main Store',
          location_id: `LOC-${business.id}-001`,
          city: data.city,
          state: data.state || 'Unknown',
          zip_code: data.zipCode || '000000',
          country: data.country,
          landmark: data.landmark || '',
          is_active: true,
          is_default: true,
          business: business.id,
        },
        overrideAccess: true,
      })

      console.log(`Default location created for business: ${business.id}`)
    } catch (locationError) {
      console.error('Default location creation failed:', locationError)
      // Continue even if location creation fails
    }

    return Response.json(
      {
        message: 'Business registered successfully',
        businessId: business.id,
        userId: user.id,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Registration Error:', error)
    return Response.json({ error: error.message || 'Registration failed' }, { status: 500 })
  }
}
