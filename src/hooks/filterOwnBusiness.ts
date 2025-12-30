import type { Access } from 'payload'

export const filterOwnBusiness: Access = ({ req }) => {
  const user = req.user

  if (!user) return false

  if (user.roles?.includes('admin')) return true

  if (user.business) {
    return {
      id: {
        equals: typeof user.business === 'object' ? user.business.id : user.business,
      },
    }
  }

  return false
}
