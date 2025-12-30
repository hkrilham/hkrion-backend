import type { AccessResult, CollectionConfig } from 'payload'
import { setBusinessOnCreate } from '../hooks/setBusinessOnCreate'

/**
 * Helper to check if user is a super admin
 */
const checkSuperAdmin = async (payload: any, userId: string | number): Promise<boolean> => {
  try {
    const superAdminCheck = await payload.find({
      collection: 'super-admins',
      where: {
        and: [{ user: { equals: userId } }, { is_active: { equals: true } }],
      },
      limit: 1,
      overrideAccess: true,
    })
    return superAdminCheck.totalDocs > 0
  } catch {
    return false
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Filter users by business - admins see only their business users
    read: async ({ req }) => {
      const user = req.user
      if (!user) return false

      // Check if super admin (can see all)
      const isSuperAdmin = await checkSuperAdmin(req.payload, user.id)
      if (isSuperAdmin) return true

      // Business admins can only see users from their business
      if (user.roles?.includes('admin') && user.business) {
        const businessId =
          typeof user.business === 'object' ? (user.business as any).id : user.business
        return {
          business: { equals: businessId },
        } as AccessResult
      }

      // Normal users can only read themselves
      return {
        id: { equals: user.id },
      } as AccessResult
    },
    // Update - admins can update their business users
    update: async ({ req }) => {
      const user = req.user
      if (!user) return false

      // Check if super admin
      const isSuperAdmin = await checkSuperAdmin(req.payload, user.id)
      if (isSuperAdmin) return true

      // Business admins can update their business users
      if (user.roles?.includes('admin') && user.business) {
        const businessId =
          typeof user.business === 'object' ? (user.business as any).id : user.business
        return {
          business: { equals: businessId },
        } as AccessResult
      }

      // Users can update themselves
      return {
        id: { equals: user.id },
      } as AccessResult
    },
    // Delete - only super admins or business admins for their users
    delete: async ({ req }) => {
      const user = req.user
      if (!user) return false

      // Check if super admin
      const isSuperAdmin = await checkSuperAdmin(req.payload, user.id)
      if (isSuperAdmin) return true

      // Business admins can delete their business users
      if (user.roles?.includes('admin') && user.business) {
        const businessId =
          typeof user.business === 'object' ? (user.business as any).id : user.business
        return {
          business: { equals: businessId },
        } as AccessResult
      }

      return false
    },
    // Create - only admins can create users
    create: ({ req }) => req.user?.roles?.includes('admin') || false,
  },
  hooks: {
    beforeChange: [setBusinessOnCreate],
  },
  auth: true,
  fields: [
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Cashier', value: 'cashier' },
      ],
      defaultValue: ['user'],
    },
  ],
}
