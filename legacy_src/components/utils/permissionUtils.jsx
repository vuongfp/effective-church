/**
 * Permission & Access Control Utilities
 * Handles role-based and ministry-based access checks
 */

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  volunteer: 1,
  kids_leader: 2,
  youth_leader: 2,
  staff: 3,
  accountant: 3,
  pastor: 4,
  admin: 5,
};

/**
 * Check if user has a certain role or higher
 * @param {string} userRole - User's current role
 * @param {string} requiredRole - Minimum required role
 * @returns {boolean}
 */
export function hasRole(userRole, requiredRole) {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

/**
 * Check if user can view a record based on confidential settings
 * @param {object} record - Record with optional confidential_roles field
 * @param {object} user - Current user object with role, ministry, can_view_confidential
 * @returns {boolean}
 */
export function canViewRecord(record, user) {
  if (!record) return false;

  // Admins can see everything
  if (hasRole(user?.role, "admin")) return true;

  // If record has confidential_roles restriction
  if (record.confidential_roles && record.confidential_roles.length > 0) {
    // Check if user role is in allowed list
    const isRoleAllowed = record.confidential_roles.includes(user?.role);
    
    // Also check if user can view confidential
    const hasConfidentialAccess = user?.can_view_confidential || isRoleAllowed;
    
    return hasConfidentialAccess;
  }

  // No confidential restriction, everyone can view
  return true;
}

/**
 * Check if user can edit a record
 * @param {string} userRole - User's role
 * @returns {boolean}
 */
export function canEdit(userRole) {
  return hasRole(userRole, "staff");
}

/**
 * Check if user can delete a record
 * @param {string} userRole - User's role
 * @returns {boolean}
 */
export function canDelete(userRole) {
  return hasRole(userRole, "pastor");
}

/**
 * Get ministry-specific filter for user
 * @param {object} user - User object
 * @returns {object} - Filter object for API queries
 */
export function getMinistryFilter(user) {
  if (!user || hasRole(user.role, "admin")) {
    return {}; // Admins see all
  }

  if (user.ministry) {
    return { ministry: user.ministry };
  }

  return {};
}

/**
 * Filter array of records by user access
 * @param {array} records - Array of records
 * @param {object} user - Current user
 * @returns {array} - Filtered records
 */
export function filterAccessibleRecords(records, user) {
  if (!Array.isArray(records)) return [];
  return records.filter(r => canViewRecord(r, user));
}

/**
 * Get accessible roles for current user (for filtering dropdowns, etc)
 * @param {string} userRole - User's current role
 * @returns {array} - List of roles user can manage
 */
export function getManageableRoles(userRole) {
  if (hasRole(userRole, "admin")) {
    return ["admin", "pastor", "staff", "accountant", "youth_leader", "kids_leader", "volunteer"];
  }
  if (hasRole(userRole, "pastor")) {
    return ["staff", "youth_leader", "kids_leader", "volunteer"];
  }
  return [];
}

export const ROLES = {
  ADMIN: "admin",
  PASTOR: "pastor",
  STAFF: "staff",
  ACCOUNTANT: "accountant",
  YOUTH_LEADER: "youth_leader",
  KIDS_LEADER: "kids_leader",
  VOLUNTEER: "volunteer",
};

export const MINISTRIES = {
  PASTORAL: "pastoral",
  WORSHIP: "worship",
  YOUTH: "youth",
  CHILDREN: "children",
  ADMINISTRATIVE: "administrative",
  FINANCE: "finance",
  OUTREACH: "outreach",
  GENERAL: "general",
};