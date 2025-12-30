import type { Access } from 'payload'

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

export const filterByBusiness: Access = async ({ req }) => {
  const user = req.user

  if (!user) return false

  // Check if super admin (can see all data across all businesses)
  const isSuperAdmin = await checkSuperAdmin(req.payload, user.id)
  if (isSuperAdmin) return true

  // If user has a business assigned, filter by it
  if (user.business) {
    return {
      business: {
        equals: typeof user.business === 'object' ? user.business.id : user.business,
      },
    }
  }

  // If normal user has no business, accessing business-scoped data should probably return nothing
  return false
}
