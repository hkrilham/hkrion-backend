import type { Access } from 'payload'

/**
 * Check if the current user is a Super Admin
 * Super Admins are stored in the super-admins collection
 *
 * This is different from business admins - only HKRiON staff should be super admins
 */
export const isSuperAdmin: Access = async ({ req }) => {
  const user = req.user

  // Must be logged in
  if (!user) return false

  try {
    // Check if user exists in super-admins table and is active
    const superAdminCheck = await req.payload.find({
      collection: 'super-admins',
      where: {
        and: [{ user: { equals: user.id } }, { is_active: { equals: true } }],
      },
      limit: 1,
      overrideAccess: true, // Important: bypass access control to check
    })

    return superAdminCheck.totalDocs > 0
  } catch (error) {
    console.error('Super Admin check failed:', error)
    return false
  }
}

/**
 * Synchronous version for simple checks
 * Use this when you already have the super admin status
 */
export const isSuperAdminSync: Access = ({ req }) => {
  // This is a fallback - ideally use the async version
  // For now, we check if user has the special marker
  const user = req.user

  if (!user) return false

  // Check if user has superAdmin flag (set by middleware/session)
  return (user as any)._isSuperAdmin === true
}
