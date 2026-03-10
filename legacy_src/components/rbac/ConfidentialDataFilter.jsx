import { base44 } from "@/api/base44Client";

/**
 * Filters confidential data based on user role
 * Returns items where:
 * - No confidential_roles field (public data)
 * - User's role is in the allowed confidential_roles
 */
export async function filterConfidentialData(items, userRole) {
  if (!items || !Array.isArray(items)) return items;

  const user = await base44.auth.me().catch(() => null);
  if (!user) return [];

  // Admins see everything
  if (user.role === "admin") return items;

  return items.filter(item => {
    // No confidential restriction = everyone can see
    if (!item.confidential_roles || item.confidential_roles.length === 0) {
      return true;
    }
    // User's role is in allowed list
    return item.confidential_roles.includes(user.role);
  });
}

/**
 * Check if a specific user can view confidential item
 */
export async function canViewConfidentialItem(item, userRole) {
  const user = await base44.auth.me().catch(() => null);
  if (!user) return false;

  // Admins can view everything
  if (user.role === "admin") return true;

  // No restriction = everyone can view
  if (!item.confidential_roles || item.confidential_roles.length === 0) {
    return true;
  }

  // Check if user's role is in allowed list
  return item.confidential_roles.includes(user.role);
}