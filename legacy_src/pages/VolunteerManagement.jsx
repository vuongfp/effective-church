import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Users } from "lucide-react";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import VolunteerForm from "@/components/volunteer/VolunteerForm.jsx";

export default function VolunteerManagement() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const queryClient = useQueryClient();
  const { lang } = useLang();

  const { data: volunteers = [], isLoading } = useQuery({
    queryKey: ["volunteers"],
    queryFn: () => base44.entities.Volunteer.list("-created_date"),
  });

  const deleteVolunteerMutation = useMutation({
    mutationFn: (id) => base44.entities.Volunteer.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    },
  });

  const filteredVolunteers = volunteers.filter(v =>
    `${v.first_name} ${v.last_name} ${v.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: volunteers.length,
    active: volunteers.filter(v => v.status === "active").length,
    available: volunteers.filter(v => v.availability === "available").length,
  };

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    inactive: "bg-slate-100 text-slate-600",
    paused: "bg-amber-100 text-amber-700",
  };

  const availabilityColors = {
    available: "bg-blue-100 text-blue-700",
    unavailable: "bg-red-100 text-red-700",
    on_leave: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">{lang === "vi" ? "Quản lý Tình nguyện viên" : "Volunteer Management"}</h1>
        <Button onClick={() => { setEditingVolunteer(null); setShowForm(true); }} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" /> {t("Add New", lang)}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">{lang === "vi" ? "Tổng cộng" : "Total"}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-emerald-600">{lang === "vi" ? "Đang hoạt động" : "Active"}</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-blue-600">{lang === "vi" ? "Sẵn sàng" : "Available"}</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{stats.available}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <Input
          placeholder={lang === "vi" ? "Tìm kiếm tình nguyện viên..." : "Search volunteers..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Volunteer List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Users className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm">{lang === "vi" ? "Chưa có tình nguyện viên" : "No volunteers yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredVolunteers.map((vol) => (
            <Card key={vol.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{vol.first_name} {vol.last_name}</h3>
                    <p className="text-sm text-slate-500">{vol.email}</p>
                    {vol.phone && <p className="text-sm text-slate-500">{vol.phone}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={statusColors[vol.status] || "bg-slate-100 text-slate-600"}>
                        {vol.status}
                      </Badge>
                      <Badge className={availabilityColors[vol.availability] || "bg-slate-100 text-slate-600"}>
                        {vol.availability}
                      </Badge>
                      {vol.skills && vol.skills.length > 0 && (
                        <Badge variant="outline">{vol.skills.length} {lang === "vi" ? "kỹ năng" : "skills"}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingVolunteer(vol); setShowForm(true); }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteVolunteerMutation.mutate(vol.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VolunteerForm
        open={showForm}
        onOpenChange={setShowForm}
        volunteer={editingVolunteer}
        onSaved={() => {
          setShowForm(false);
          setEditingVolunteer(null);
          queryClient.invalidateQueries({ queryKey: ["volunteers"] });
        }}
      />
    </div>
  );
}