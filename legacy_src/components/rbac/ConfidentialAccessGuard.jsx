import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Filters array of records, removing those the user cannot view
 * Used for entity lists with confidential_roles restrictions
 */
export async function filterByConfidentialAccess(records, userRole) {
  if (!userRole || userRole === "admin") return records;

  return records.filter(record => {
    // If no confidential restriction, include it
    if (!record.confidential_roles || record.confidential_roles.length === 0) {
      return true;
    }
    // Only include if user's role is in the allowed list
    return record.confidential_roles.includes(userRole);
  });
}

/**
 * Hook to check and filter confidential data access
 */
export function useConfidentialDataFilter() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const filterRecords = async (records) => {
    return filterByConfidentialAccess(records, user?.role);
  };

  const canViewConfidential = (record) => {
    if (!record?.confidential_roles || record.confidential_roles.length === 0) {
      return true;
    }
    return user?.role === "admin" || record.confidential_roles.includes(user?.role);
  };

  return {
    filterRecords,
    canViewConfidential,
    userRole: user?.role,
    isAdmin: user?.role === "admin",
  };
}

/**
 * Component to show restricted confidential data message
 */
export function ConfidentialDataRestricted({ reason = "confidential data" }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
      <Lock className="w-4 h-4 text-red-600" />
      <span className="text-sm text-red-700">This is {reason}. You don't have access.</span>
    </div>
  );
}

/**
 * Component to conditionally display fields based on confidential access
 */
export function ConfidentialField({
  record,
  fieldName,
  label,
  children,
  canView = true,
}) {
  const { canViewConfidential } = useConfidentialDataFilter();

  const hasAccess = canView && canViewConfidential(record);

  if (!hasAccess) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <ConfidentialDataRestricted />
      </div>
    );
  }

  return <>{children}</>;
}