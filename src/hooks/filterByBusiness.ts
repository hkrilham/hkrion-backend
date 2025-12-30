import type { Access } from 'payload'

export const filterByBusiness: Access = ({ req }) => {
  const user = req.user

  if (!user) return false

  // Allow system admins (checking typical 'admin' role in Users collection)
  if (user.roles?.includes('admin')) return true

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
