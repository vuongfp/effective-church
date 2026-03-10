import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import PermissionGrid from "./PermissionGrid";

export default function RoleForm({ role, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6366f1",
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const queryClient = useQueryClient();

  const { data: permissions = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => base44.entities.Permission.list(),
  });

  const { data: rolePermissions = [] } = useQuery({
    queryKey: ["rolePermissions", role?.id],
    queryFn: () => role?.id ? base44.entities.RolePermission.filter({ role_id: role.id }) : Promise.resolve([]),
    enabled: !!role?.id,
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || "",
        color: role.color || "#6366f1",
      });
      setSelectedPermissions(rolePermissions.filter(rp => rp.is_granted).map(rp => rp.permission_id));
    }
  }, [role, rolePermissions]);

  const saveRoleMutation = useMutation({
    mutationFn: async (data) => {
      if (role?.id) {
        await base44.entities.CustomRole.update(role.id, {
          name: data.name,
          description: data.description,
          color: data.color,
        });
        return role.id;
      } else {
        const newRole = await base44.entities.CustomRole.create({
          name: data.name,
          description: data.description,
          color: data.color,
        });
        return newRole.id;
      }
    },
    onSuccess: async (roleId) => {
      // Clear existing permissions
      const existing = await base44.entities.RolePermission.filter({ role_id: roleId });
      for (const rp of existing) {
        await base44.entities.RolePermission.delete(rp.id);
      }

      // Add new permissions
      for (const permId of selectedPermissions) {
        const perm = permissions.find(p => p.id === permId);
        await base44.entities.RolePermission.create({
          role_id: roleId,
          role_name: formData.name,
          permission_id: permId,
          permission_name: perm?.name || "",
          is_granted: true,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["customRoles"] });
      queryClient.invalidateQueries({ queryKey: ["rolePermissions"] });
      onSaved?.();
      onClose?.();
    },
  });

  const handlePermissionChange = (permId, checked) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permId]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permId));
    }
  };



  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Role Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Treasurer, Youth Leader"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this role"
              className="mt-1 h-20"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Color</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-12 h-9 rounded border border-input cursor-pointer mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Permissions</label>
            {permissions.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                No permissions found. Please click "Initialize Permissions" on the User & Role Management page to load system permissions.
              </div>
            ) : (
              <PermissionGrid
                permissions={permissions}
                selectedPermissions={selectedPermissions}
                onPermissionChange={handlePermissionChange}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => saveRoleMutation.mutate(formData)}
            disabled={saveRoleMutation.isPending || !formData.name}
          >
            {saveRoleMutation.isPending ? "Saving..." : "Save Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}