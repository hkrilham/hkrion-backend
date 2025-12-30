import type { CollectionBeforeChangeHook } from 'payload'

export const setBusinessOnCreate: CollectionBeforeChangeHook = ({ data, req }) => {
  const user = req.user

  // Ensure user is logged in
  if (!user) return data

  // If business is already provided (e.g. by admin), respect it
  if (data.business) return data

  // Auto-assign user's business
  if (user.business) {
    data.business = typeof user.business === 'object' ? user.business.id : user.business
  }

  return data
}
