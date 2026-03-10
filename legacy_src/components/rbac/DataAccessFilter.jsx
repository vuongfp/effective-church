import { useConfidentialDataFilter } from "@/components/rbac/ConfidentialAccessGuard";

/**
 * Hook to filter entity data based on user's role and permissions
 * Removes confidential records the user cannot access
 */
export function useDataAccessFilter() {
  const { filterRecords, canViewConfidential, userRole, isAdmin } = useConfidentialDataFilter();

  /**
   * Filter records for display in lists/tables
   * @param {array} records - Array of entity records
   * @returns {array} - Filtered records
   */
  const filterRecordsForDisplay = async (records) => {
    if (isAdmin || !Array.isArray(records)) return records;

    return records.filter(record => {
      // If record has no confidential_roles restriction, it's public
      if (!record.confidential_roles || record.confidential_roles.length === 0) {
        return true;
      }

      // Only include if user's role is in allowed list
      return record.confidential_roles.includes(userRole);
    });
  };

  /**
   * Mask confidential fields in a record
   * @param {object} record - Single record
   * @param {array} confidentialFields - Field names to mask
   * @returns {object} - Record with masked fields
   */
  const maskConfidentialFields = (record, confidentialFields = []) => {
    if (isAdmin || !canViewConfidential(record)) {
      return record;
    }

    const masked = { ...record };
    confidentialFields.forEach(field => {
      masked[field] = "[RESTRICTED]";
    });
    return masked;
  };

  /**
   * Check if user can view a specific field in a record
   * @param {object} record - Record with confidential_roles
   * @param {string} field - Field name
   * @returns {boolean}
   */
  const canViewField = (record, field) => {
    return isAdmin || canViewConfidential(record);
  };

  return {
    filterRecordsForDisplay,
    maskConfidentialFields,
    canViewField,
    canViewConfidential,
    userRole,
    isAdmin,
  };
}

/**
 * Wrapper to automatically filter entity list queries
 * @param {array} records - Original records from API
 * @param {string} userRole - Current user's role
 * @returns {array} - Filtered records
 */
export function filterByUserAccess(records, userRole) {
  if (userRole === "admin" || !Array.isArray(records)) {
    return records;
  }

  return records.filter(record => {
    if (!record.confidential_roles || record.confidential_roles.length === 0) {
      return true;
    }
    return record.confidential_roles.includes(userRole);
  });
}