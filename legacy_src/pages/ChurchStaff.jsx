import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus, Mail, Phone, Calendar, Trash2, Edit, Users, CheckCircle2, Heart, Briefcase
} from "lucide-react";
import { format } from "date-fns";
import StaffForm from "@/components/church/StaffForm";
import EmptyState from "@/components/shared/EmptyState.jsx";
import { useLang } from "@/components/i18n/LanguageContext";

const roleLabels = {
  en: {
    pastor: "Pastor",
    assistant_pastor: "Assistant Pastor",
    worship_leader: "Worship Leader",
    youth_director: "Youth Director",
    children_director: "Children's Director",
    administrative: "Administrative",
    volunteer_coordinator: "Volunteer Coordinator",
    treasurer: "Treasurer",
    secretary: "Secretary",
    other: "Other"
  },
  vi: {
    pastor: "Mục sư",
    assistant_pastor: "Phó mục sư",
    worship_leader: "Trưởng ban ca ngợi",
    youth_director: "Trưởng ban thanh niên",
    children_director: "Trưởng ban thiếu nhi",
    administrative: "Hành chính",
    volunteer_coordinator: "Điều phối tình nguyện viên",
    treasurer: "Thủ quỹ",
    secretary: "Thư ký",
    other: "Khác"
  }
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  on_leave: "bg-yellow-100 text-yellow-800"
};

const statusLabels = {
  en: {
    active: "Active",
    inactive: "Inactive",
    on_leave: "On Leave"
  },
  vi: {
    active: "Đang hoạt động",
    inactive: "Không hoạt động",
    on_leave: "Đang nghỉ phép"
  }
};

const availabilityLabels = {
  en: {
    available: "Available",
    unavailable: "Unavailable",
    on_leave: "On Leave"
  },
  vi: {
    available: "Sẵn sàng",
    unavailable: "Không sẵn sàng",
    on_leave: "Đang nghỉ phép"
  }
};

const availabilityColors = {
  available: "bg-blue-100 text-blue-700",
  unavailable: "bg-red-100 text-red-700",
  on_leave: "bg-orange-100 text-orange-700"
};

export default function ChurchStaff() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const { lang } = useLang();
  const queryClient = useQueryClient();

  const { data: staff = [] } = useQuery({
    queryKey: ["staff"],
    queryFn: () => base44.entities.Staff.list("-created_date", 1000)
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (id) => base44.entities.Staff.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] })
  });

  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const matchSearch = `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === "all" || s.type === filterType;
      return matchSearch && matchType;
    });
  }, [staff, searchTerm, filterType]);

  const stats = useMemo(() => ({
    total: staff.length,
    staffCount: staff.filter(s => s.type === "staff" || !s.type).length,
    volunteerCount: staff.filter(s => s.type === "volunteer").length,
    active: staff.filter(s => s.status === "active").length
  }), [staff]);

  const labels = {
    en: {
      title: "Staff & Volunteers",
      subtitle: "Manage staff members and volunteers",
      addBtn: "Add Person",
      search: "Search...",
      staff: "Staff",
      volunteers: "Volunteers",
      total: "Total",
      active: "Active",
      noData: "No staff or volunteers yet",
      edit: "Edit",
      delete: "Delete",
      from: "From:"
    },
    vi: {
      title: "Nhân viên & Tình nguyện viên",
      subtitle: "Quản lý nhân viên và tình nguyện viên",
      addBtn: "Thêm người",
      search: "Tìm kiếm...",
      staff: "Nhân viên",
      volunteers: "Tình nguyện viên",
      total: "Tổng cộng",
      active: "Đang hoạt động",
      noData: "Chưa có nhân viên hay tình nguyện viên nào",
      edit: "Sửa",
      delete: "Xóa",
      from: "Từ:",
      skills: "kỹ năng",
      permissions: "quyền hạn"
    }
  };

  const L = labels[lang] || labels.en;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{L.title}</h1>
            <p className="text-slate-600 mt-1 text-sm">{L.subtitle}</p>
          </div>
          <Button
            onClick={() => {
              setEditingStaff(null);
              setShowForm(true);
            }}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {L.addBtn}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">{L.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-1">
                <Briefcase className="w-4 h-4" /> {L.staff}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.staffCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-1">
                <Heart className="w-4 h-4" /> {L.volunteers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-violet-600">{stats.volunteerCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">{L.active}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <Input
            placeholder={L.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              className="text-sm"
            >
              {L.total}
            </Button>
            <Button
              variant={filterType === "staff" ? "default" : "outline"}
              onClick={() => setFilterType("staff")}
              className="text-sm gap-1"
            >
              <Briefcase className="w-4 h-4" size={16} /> {L.staff}
            </Button>
            <Button
              variant={filterType === "volunteer" ? "default" : "outline"}
              onClick={() => setFilterType("volunteer")}
              className="text-sm gap-1"
            >
              <Heart className="w-4 h-4" size={16} /> {L.volunteers}
            </Button>
          </div>
        </div>

        {/* List */}
        {filteredStaff.length === 0 ? (
          <EmptyState
            Icon={Users}
            title={L.noData}
            actionLabel={L.addBtn}
            onAction={() => {
              setEditingStaff(null);
              setShowForm(true);
            }}
          />
        ) : (
          <div className="grid gap-4">
            {filteredStaff.map(s => (
              <Card key={s.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {s.first_name} {s.last_name}
                        </h3>
                        <Badge className={statusColors[s.status]}>
                          {statusLabels[lang]?.[s.status]}
                        </Badge>
                        <Badge variant={s.type === "staff" ? "default" : "secondary"}>
                          {s.type === "staff" ? L.staff : L.volunteers}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600 mb-3">
                        {s.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" /> {s.email}
                          </div>
                        )}
                        {s.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" /> {s.phone}
                          </div>
                        )}
                        {s.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {L.from} {format(new Date(s.start_date), "dd/MM/yyyy")}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {s.role && (
                          <Badge variant="outline">
                            {roleLabels[lang]?.[s.role] || s.role}
                          </Badge>
                        )}
                        {s.type === "volunteer" && s.availability && (
                          <Badge className={availabilityColors[s.availability]}>
                            {availabilityLabels[lang]?.[s.availability]}
                          </Badge>
                        )}
                        {s.skills && s.skills.length > 0 && (
                          <Badge variant="outline">{s.skills.length} {L.skills}</Badge>
                        )}
                        {s.department && (
                          <Badge variant="outline">{s.department}</Badge>
                        )}
                        {s.permissions && s.permissions.length > 0 && (
                          <Badge variant="outline">{s.permissions.length} {L.permissions}</Badge>
                        )}
                      </div>

                      {s.biography && (
                        <div className="text-sm text-slate-600 mt-2">
                          {s.biography}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingStaff(s);
                          setShowForm(true);
                        }}
                        className="gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        {L.edit}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteStaffMutation.mutate(s.id)}
                        className="text-red-600 hover:text-red-700 gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        {L.delete}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <StaffForm
            staff={editingStaff}
            onSaved={() => {
              setShowForm(false);
              setEditingStaff(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingStaff(null);
            }}
          />
        )}
      </div>
    </div>
  );
}