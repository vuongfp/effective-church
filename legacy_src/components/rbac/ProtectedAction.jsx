import React from "react";
import { usePermission } from "./usePermission";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function ProtectedAction({ 
  resourceType, 
  resourceName, 
  action = "view",
  children,
  fallback = null,
  onDenied = null 
}) {
  const { hasPermission, isLoading } = usePermission(resourceType, resourceName, action);
  const [showDenied, setShowDenied] = React.useState(false);

  if (isLoading) return null;

  if (!hasPermission) {
    if (onDenied) onDenied();
    return fallback || (
      <>
        <button
          disabled
          className="opacity-50 cursor-not-allowed"
          onClick={() => setShowDenied(true)}
        >
          {children}
        </button>
        <AlertDialog open={showDenied} onOpenChange={setShowDenied}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Access Denied</AlertDialogTitle>
              <AlertDialogDescription>
                You don't have permission to {action} this {resourceName}.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return children;
}