import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus, MapPin, Mail, Phone, MessageSquare, Calendar, Trash2, Filter, X
} from "lucide-react";
import { format, differenceInDays, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import VisitorForm from "@/components/church/VisitorForm";
import EmptyState from "@/components/shared/EmptyState.jsx";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";

const statusLabels = {
  en: { first_time: "First Time", returning: "Returning", converted_member: "Member" },
  vi: { first_time: "Lần đầu", returning: "Quay lại", converted_member: "Đã gia nhập" },
  fr: { first_time: "Première visite", returning: "Revient", converted_member: "Devient membre" }
};

const statusColors = {
  first_time: "bg-blue-100 text-blue-800",
  returning: "bg-purple-100 text-purple-800",
  converted_member: "bg-green-100 text-green-800"
};

export default function ChurchVisitors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const { lang } = useLang();
  const queryClient = useQueryClient();

  const { data: visitors = [] } = useQuery({
    queryKey: ["visitors"],
    queryFn: () => base44.entities.Visitor.list("-created_date")
  });

  const deleteVisitorMutation = useMutation({
    mutationFn: (id) => base44.entities.Visitor.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["visitors"] })
  });

  const filteredVisitors = useMemo(() => {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(new Date());
    const monthStart = startOfMonth(new Date());

    return visitors.filter(v => {
      // Search filter
      const searchMatch = `${v.first_name} ${v.last_name} ${v.email}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const statusMatch = statusFilter === "all" || v.status === statusFilter;
      
      // Date filter
      let dateMatch = true;
      if (dateFilter !== "all" && v.last_visit_date) {
        const lastVisit = startOfDay(new Date(v.last_visit_date));
        if (dateFilter === "today") {
          dateMatch = lastVisit.getTime() === today.getTime();
        } else if (dateFilter === "week") {
          dateMatch = lastVisit >= weekStart && lastVisit <= today;
        } else if (dateFilter === "month") {
          dateMatch = lastVisit >= monthStart && lastVisit <= today;
        }
      }
      
      return searchMatch && statusMatch && dateMatch;
    });
  }, [visitors, searchTerm, statusFilter, dateFilter]);

  const stats = useMemo(() => ({
    total: visitors.length,
    new: visitors.filter(v => v.status === "first_time").length,
    returning: visitors.filter(v => v.status === "returning").length
  }), [visitors]);

  const recordVisitMutation = useMutation({
    mutationFn: (visitor) => {
      const today = format(new Date(), "yyyy-MM-dd");
      const isNewVisit = visitor.last_visit_date !== today;
      return base44.entities.Visitor.update(visitor.id, {
        status: visitor.status === "first_time" ? "returning" : visitor.status,
        last_visit_date: today,
        visit_count: (visitor.visit_count || 1) + (isNewVisit ? 1 : 0)
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["visitors"] })
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {lang === "vi" ? "Theo dõi khách" : lang === "fr" ? "Suivi des visiteurs" : "Visitor Tracking"}
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              {lang === "vi" ? "Quản lý và theo dõi những khách thăm viếng" : lang === "fr" ? "Gérez et suivez les visiteurs" : "Manage and track church visitors"}
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingVisitor(null);
              setShowForm(true);
            }}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {lang === "vi" ? "Khách mới" : lang === "fr" ? "Nouveau visiteur" : "New Visitor"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">
                {lang === "vi" ? "Tổng khách" : "Total"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">
                {lang === "vi" ? "Lần đầu" : "First Time"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">
                {lang === "vi" ? "Quay lại" : "Returning"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.returning}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <Input
            placeholder={lang === "vi" ? "Tìm khách..." : "Search visitors..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <Filter className="w-4 h-4" />
                {lang === "vi" ? "Trạng thái:" : "Status:"}
              </span>
              <div className="flex gap-2">
                {[
                  { key: "all", label: lang === "vi" ? "Tất cả" : "All" },
                  { key: "first_time", label: lang === "vi" ? "Lần đầu" : "First Time" },
                  { key: "returning", label: lang === "vi" ? "Quay lại" : "Returning" },
                  { key: "converted_member", label: lang === "vi" ? "Đã gia nhập" : "Member" }
                ].map(status => (
                  <Button
                    key={status.key}
                    size="sm"
                    variant={statusFilter === status.key ? "default" : "outline"}
                    onClick={() => setStatusFilter(status.key)}
                    className={statusFilter === status.key ? "bg-violet-600" : ""}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {lang === "vi" ? "Ngày ghé thăm:" : "Visit Date:"}
              </span>
              <div className="flex gap-2">
                {[
                  { key: "all", label: lang === "vi" ? "Tất cả" : "All" },
                  { key: "today", label: lang === "vi" ? "Hôm nay" : "Today" },
                  { key: "week", label: lang === "vi" ? "Tuần này" : "This Week" },
                  { key: "month", label: lang === "vi" ? "Tháng này" : "This Month" }
                ].map(date => (
                  <Button
                    key={date.key}
                    size="sm"
                    variant={dateFilter === date.key ? "default" : "outline"}
                    onClick={() => setDateFilter(date.key)}
                    className={dateFilter === date.key ? "bg-violet-600" : ""}
                  >
                    {date.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {(statusFilter !== "all" || dateFilter !== "all") && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
                {lang === "vi" ? "Xóa bộ lọc" : "Clear"}
              </Button>
            )}
          </div>
        </div>

        {/* Visitor List */}
        {filteredVisitors.length === 0 ? (
          <EmptyState
            Icon={UserPlus}
            title={lang === "vi" ? "Chưa có khách nào" : "No visitors yet"}
            description={lang === "vi" ? "Bắt đầu theo dõi khách thăm viếng" : "Start tracking your church visitors"}
            actionLabel={lang === "vi" ? "Thêm khách" : "Add Visitor"}
            onAction={() => {
              setEditingVisitor(null);
              setShowForm(true);
            }}
          />
        ) : (
          <div className="grid gap-4">
            {filteredVisitors.map(visitor => (
              <Card key={visitor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                   <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-2 flex-wrap">
                         <h3 className="font-semibold text-slate-900">
                           {visitor.first_name} {visitor.last_name}
                         </h3>
                         <Badge className={statusColors[visitor.status]}>
                           {statusLabels[lang]?.[visitor.status] || visitor.status}
                         </Badge>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600">
                        {visitor.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" /> {visitor.email}
                          </div>
                        )}
                        {visitor.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" /> {visitor.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {lang === "vi" ? "Lần đầu:" : "First:"} {format(new Date(visitor.first_visit_date), "dd/MM")}
                        </div>
                        {visitor.last_visit_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {lang === "vi" ? "Lần cuối:" : "Last:"} {format(new Date(visitor.last_visit_date), "dd/MM")}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {lang === "vi" ? "Số lượt:" : "Visits:"} <span className="font-semibold">{visitor.visit_count || 1}</span>
                        </div>
                      </div>

                      {visitor.address && (
                        <div className="flex items-start gap-1 text-sm text-slate-600 mt-2">
                          <MapPin className="w-4 h-4 mt-0.5" /> {visitor.address}
                        </div>
                      )}

                      {visitor.notes && (
                        <div className="text-sm text-slate-600 mt-2 italic">
                          "{visitor.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-col gap-2 w-full md:w-auto">
                      {visitor.status !== "converted_member" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => recordVisitMutation.mutate(visitor)}
                          disabled={recordVisitMutation.isPending}
                          className="gap-1 w-full md:w-auto justify-center"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {recordVisitMutation.isPending ? "..." : (lang === "vi" ? "Ghi nhận" : "Record")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingVisitor(visitor);
                          setShowForm(true);
                        }}
                        className="w-full md:w-auto justify-center"
                      >
                        {lang === "vi" ? "Sửa" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteVisitorMutation.mutate(visitor.id)}
                        className="text-red-600 hover:text-red-700 w-full md:w-auto justify-center"
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

        {/* Form Modal */}
        {showForm && (
          <VisitorForm
            visitor={editingVisitor}
            onSaved={() => {
              setShowForm(false);
              setEditingVisitor(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingVisitor(null);
            }}
          />
        )}
      </div>
    </div>
  );
}