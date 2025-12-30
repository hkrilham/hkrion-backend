import type { CollectionBeforeChangeHook } from 'payload'

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

export const setBusinessOnCreate: CollectionBeforeChangeHook = async ({ data, req }) => {
  const user = req.user

  // Ensure user is logged in
  if (!user) return data

  // Check if super admin
  const isSuperAdmin = await checkSuperAdmin(req.payload, user.id)

  // If super admin limits explicitly sets a business, allow it
  if (isSuperAdmin && data.business) {
    return data
  }

  // For everyone else (includng Business Admins), FORCE their own business
  if (user.business) {
    data.business = typeof user.business === 'object' ? user.business.id : user.business
  }

  return data
}
