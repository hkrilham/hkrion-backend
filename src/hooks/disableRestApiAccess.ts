import type { Access } from 'payload'

/**
 * Disables REST API access for non-admin users.
 * - Admin users can still access via Admin Panel
 * - Custom endpoints should use Local API with overrideAccess: true
 */
export const disableRestApiAccess: Access = ({ req }) => {
  // Allow admin users (for Admin Panel access)
  if (req.user?.roles?.includes('admin')) {
    return true
  }
  // Block REST API access for all other users
  return false
}
