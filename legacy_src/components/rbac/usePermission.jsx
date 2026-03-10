import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useEffect, useState } from "react";

export function usePermission(resourceType, resourceName, action = "view") {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Admin always has permission
  if (user?.role === "admin") {
    return { hasPermission: true, isLoading: false };
  }

  const { data: rolePermissions = [], isLoading } = useQuery({
    queryKey: ["rolePermissions", user?.role, resourceType, resourceName, action],
    queryFn: async () => {
      if (!user?.role) return [];
      
      const roles = await base44.entities.CustomRole.filter({ name: user.role });
      if (!roles.length) return [];

      const permissionName = `${action}_${resourceName}`;
      const rolePerm = await base44.entities.RolePermission.filter({
        role_id: roles[0].id,
        permission_name: permissionName,
        is_granted: true,
      });

      return rolePerm;
    },
    enabled: !!user && user.role !== "admin",
  });

  return {
    hasPermission: user?.role === "admin" || rolePermissions.length > 0,
    isLoading: isLoading || !user,
  };
}

export function useCanAccess(pageName) {
  return usePermission("page", pageName, "view");
}

export function useCanEdit(entityName) {
  return usePermission("entity", entityName, "edit");
}

export function useCanDelete(entityName) {
  return usePermission("entity", entityName, "delete");
}

export function useCanCreate(entityName) {
  return usePermission("entity", entityName, "create");
}