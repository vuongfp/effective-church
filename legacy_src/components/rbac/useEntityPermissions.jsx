import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useState, useEffect } from "react";

/**
 * Hook to get all permissions for an entity (CRUD + confidential)
 * Returns which actions the user can perform on an entity
 */
export function useEntityPermissions(entityName) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Admin has all permissions
  if (user?.role === "admin") {
    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canViewConfidential: true,
      isLoading: false,
    };
  }

  const { data: rolePermissions = [], isLoading } = useQuery({
    queryKey: ["entityPermissions", user?.role, entityName],
    queryFn: async () => {
      if (!user?.role) return [];

      const roles = await base44.entities.CustomRole.filter({ name: user.role });
      if (!roles.length) return [];

      const rolePerms = await base44.entities.RolePermission.filter({
        role_id: roles[0].id,
        is_granted: true,
      });

      return rolePerms;
    },
    enabled: !!user && user.role !== "admin",
  });

  const permissionNames = rolePermissions.map(p => p.permission_name);

  return {
    canView: permissionNames.includes(`view_${entityName}`),
    canCreate: permissionNames.includes(`create_${entityName}`),
    canEdit: permissionNames.includes(`edit_${entityName}`),
    canDelete: permissionNames.includes(`delete_${entityName}`),
    canViewConfidential: permissionNames.includes(`view_${entityName}_Confidential`),
    isLoading: isLoading || !user,
    allPermissions: permissionNames,
  };
}

/**
 * Hook to get page permissions
 */
export function usePagePermissions(pageName) {
  const { canView, isLoading } = useQuery({
    queryKey: ["pagePermission", pageName],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return { canView: false };

      if (user.role === "admin") return { canView: true };

      const roles = await base44.entities.CustomRole.filter({ name: user.role });
      if (!roles.length) return { canView: false };

      const rolePerm = await base44.entities.RolePermission.filter({
        role_id: roles[0].id,
        permission_name: `view_${pageName}`,
        is_granted: true,
      });

      return { canView: rolePerm.length > 0 };
    },
  });

  return {
    canAccessPage: canView?.canView || false,
    isLoading,
  };
}