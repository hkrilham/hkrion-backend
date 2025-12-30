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

export const filterOwnBusiness: Access = async ({ req }) => {
  const user = req.user

  if (!user) return false

  // Check if super admin
  const isSuperAdmin = await checkSuperAdmin(req.payload, user.id)
  if (isSuperAdmin) return true

  if (user.business) {
    return {
      id: {
        equals: typeof user.business === 'object' ? user.business.id : user.business,
      },
    }
  }

  return false
}
