import React from "react";
import { usePermission } from "@/components/rbac/usePermission";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Guards content behind a permission check
 * Shows a restricted message if user doesn't have permission
 */
export function PermissionGuard({
  resourceType,
  resourceName,
  action = "view",
  children,
  fallback = null,
}) {
  const { hasPermission, isLoading } = usePermission(resourceType, resourceName, action);

  if (isLoading) {
    return <div className="text-slate-500 text-sm">Checking permissions...</div>;
  }

  if (!hasPermission) {
    return (
      fallback || (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900">Access Restricted</p>
                <p className="text-sm text-amber-700 mt-1">
                  You don't have permission to {action} this resource.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    );
  }

  return <>{children}</>;
}

/**
 * Guards a single action/button behind permission
 * Returns null if no permission (hides the element)
 */
export function ActionGuard({
  resourceType,
  resourceName,
  action = "view",
  children,
}) {
  const { hasPermission, isLoading } = usePermission(resourceType, resourceName, action);

  if (isLoading || !hasPermission) {
    return null;
  }

  return <>{children}</>;
}