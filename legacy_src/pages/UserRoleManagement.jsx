import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Search, Shield, Save, Users, Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RoleForm from "@/components/rbac/RoleForm";
import { initializeSystemPermissions, initializeDefaultRoles } from "@/components/rbac/permissionUtils";
import PermissionsGrid from "@/components/rbac/PermissionsGrid";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";

export default function UserRoleManagement() {
  const { lang } = useLang();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedUserRole, setSelectedUserRole] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["customRoles"],
    queryFn: () => base44.entities.CustomRole.filter({ is_active: true }),
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => base44.entities.Permission.list(),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });



  const deleteRoleMutation = useMutation({
    mutationFn: (roleId) => base44.entities.CustomRole.update(roleId, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customRoles"] });
      setDeleteConfirm(null);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, role }) => base44.entities.User.update(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUserId(null);
      setSelectedUserRole(null);
    },
  });

  const filteredRoles = roles.filter(r =>
    (r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    r.name !== "admin" &&
    r.name !== "Administrator"
  );

  const filteredUsers = users.filter(u => u.role !== "admin");
  const availableRoles = roles.filter(r => r.name !== "admin" && r.name !== "Administrator");

  const displayUsers = filteredUsers.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );



  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <div className="flex justify-center">
              <Lock className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold">{t("Access Denied", lang)}</h2>
            <p className="text-slate-600">{t("Only administrators can access User & Role Management.", lang)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold">{t("User & Role Management", lang)}</h1>
         <Button onClick={() => { setSelectedRole(null); setShowForm(true); }} className="gap-2">
           <Plus className="w-4 h-4" />
           {t("New Role", lang)}
         </Button>
       </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList>
           <TabsTrigger value="users">{t("Users", lang)} ({filteredUsers.length})</TabsTrigger>
           <TabsTrigger value="roles">{t("Roles", lang)} ({roles.length})</TabsTrigger>
           <TabsTrigger value="permissions">{t("Permissions", lang)} ({permissions.length})</TabsTrigger>
         </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t("Search by name or email...", lang)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {usersLoading ? (
            <div className="text-center py-8">{t("Loading users...", lang)}</div>
          ) : displayUsers.length === 0 ? (
            <Card className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">{t("No users found.", lang)}</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {displayUsers.map(user => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{user.full_name}</p>
                        <p className="text-xs text-slate-600 truncate">{user.email}</p>
                      </div>

                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedUserRole || user.role || ""}
                            onValueChange={setSelectedUserRole}
                          >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder={lang === "vi" ? "Chọn vai trò..." : lang === "fr" ? "Sélectionner rôle..." : "Select role..."} />
                              </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map(role => (
                                <SelectItem key={role.id} value={role.name}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={() => updateUserMutation.mutate({ userId: user.id, role: selectedUserRole || user.role })}
                            disabled={!selectedUserRole && !user.role}
                            className="gap-1"
                          >
                            <Save className="w-3 h-3" />
                            {t("Save", lang)}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUserId(null);
                              setSelectedUserRole(null);
                            }}
                          >
                            {t("Cancel", lang)}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {user.role || t("No role", lang)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingUserId(user.id);
                              setSelectedUserRole(user.role);
                            }}
                          >
                            {t("Edit", lang)}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t("Search roles...", lang)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {rolesLoading ? (
            <div className="text-center py-8">{t("Loading roles...", lang)}</div>
          ) : filteredRoles.length === 0 ? (
            <Card className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">{t("No roles found. Create your first role!", lang)}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRoles.map(role => (
                <Card key={role.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: role.color || "#6366f1" }}
                        />
                        <CardTitle>{role.name}</CardTitle>
                        {role.is_system && (
                          <Badge variant="outline" className="text-xs">{t("System", lang)}</Badge>
                        )}
                        </div>
                      <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelectedRole(role); setShowForm(true); }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {!role.is_system && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm(role)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle>{t("System Permissions", lang)}</CardTitle>
               <p className="text-sm text-slate-600 mt-1">
                 {t("Browse all available permissions. Assign them to roles to control access to features and data.", lang)}
               </p>
             </CardHeader>
            <CardContent>
              <PermissionsGrid permissions={permissions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showForm && (
        <RoleForm
          role={selectedRole}
          onClose={() => { setShowForm(false); setSelectedRole(null); }}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["customRoles"] })}
        />
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Delete Role?", lang)}</AlertDialogTitle>
            <AlertDialogDescription>
              {lang === "vi" ? `Bạn có chắc chắn muốn xóa vai trò "${deleteConfirm?.name}"? Hành động này không thể hoàn tác.` : lang === "fr" ? `Êtes-vous sûr de vouloir supprimer le rôle "${deleteConfirm?.name}"? Cette action ne peut pas être annulée.` : `Are you sure you want to delete the "${deleteConfirm?.name}" role? This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={() => deleteConfirm && deleteRoleMutation.mutate(deleteConfirm.id)}
            className="bg-red-600 hover:bg-red-700"
          >
            {t("Delete", lang)}
          </AlertDialogAction>
          <AlertDialogCancel>{t("Cancel", lang)}</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}