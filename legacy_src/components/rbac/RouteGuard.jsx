import React, { useEffect, useState } from "react";
import { usePagePermissions } from "@/components/rbac/useEntityPermissions";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

/**
 * Guards entire page behind permission check
 * Redirects or shows access denied if user doesn't have permission
 */
export function RouteGuard({ pageName, children }) {
  const { canAccessPage, isLoading } = usePagePermissions(pageName);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-500">Checking access...</div>
      </div>
    );
  }

  // Admin always has access
  if (user?.role === "admin") {
    return <>{children}</>;
  }

  if (!canAccessPage) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="pt-12 pb-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-red-100 rounded-full">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
              <p className="text-red-700">
                You don't have permission to access this page.
              </p>
            </div>
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}