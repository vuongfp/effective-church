import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Search, CheckCircle2, Clock, AlertCircle, Loader2, Heart, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import { format } from "date-fns";
import TaskForm from "@/components/tasks/TaskForm.jsx";
import PrayerRequestForm from "@/components/pastoral/PrayerRequestForm.jsx";
import PastoralActivityForm from "@/components/pastoral/PastoralActivityForm.jsx";

const CATEGORIES = [
  { key: "administration", label: "Quản trị", en: "Administration", fr: "Administration", color: "bg-blue-100 text-blue-700" },
  { key: "pastoral_care", label: "Chăm sóc Mục vụ", en: "Pastoral Care", fr: "Soins pastoraux", color: "bg-violet-100 text-violet-700" },
  { key: "social_responsibility", label: "Trách nhiệm Xã hội", en: "Social Responsibility", fr: "Responsabilité sociale", color: "bg-emerald-100 text-emerald-700" },
];

const STATUS_CONFIG = {
  done: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", label: { en: "Done", vi: "Đã xong", fr: "Terminé" } },
  in_progress: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-50", label: { en: "In Progress", vi: "Đang thực hiện", fr: "En cours" } },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", label: { en: "Pending", vi: "Đang chờ", fr: "En attente" } },
};

const PRIORITY_COLORS = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-slate-100 text-slate-500",
};

function getCategoryLabel(key, lang) {
  const c = CATEGORIES.find(c => c.key === key);
  if (!c) return key;
  if (lang === "vi") return c.label;
  if (lang === "fr") return c.fr;
  return c.en;
}

export default function OperationalTasks() {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchPrayer, setSearchPrayer] = useState("");
  const [searchActivity, setSearchActivity] = useState("");
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date"),
  });

  const { data: prayerRequests = [] } = useQuery({
    queryKey: ["prayer_requests"],
    queryFn: () => base44.entities.PrayerRequest.list("-created_date"),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["pastoral_activities"],
    queryFn: () => base44.entities.PastoralCareActivity.list("-activity_date"),
  });

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const groupedByCategory = CATEGORIES.map(cat => ({
    ...cat,
    tasks: filtered.filter(t => t.category === cat.key),
  }));

  const filteredPrayers = prayerRequests.filter(p =>
    `${p.contact_name} ${p.request_content}`.toLowerCase().includes(searchPrayer.toLowerCase())
  );

  const filteredActivities = activities.filter(a =>
    `${a.contact_name} ${a.notes || ""}`.toLowerCase().includes(searchActivity.toLowerCase())
  );

  const deletePrayerMutation = useMutation({
    mutationFn: (id) => base44.entities.PrayerRequest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer_requests"] });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id) => base44.entities.PastoralCareActivity.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastoral_activities"] });
    },
  });

  const stats = {
    done: tasks.filter(t => t.status === "done").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    pending: tasks.filter(t => t.status === "pending").length,
  };

  const statusColors = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    answered: "bg-emerald-100 text-emerald-700",
    closed: "bg-slate-100 text-slate-600",
  };

  const activityTypeColors = {
    visit: "bg-pink-100 text-pink-700",
    phone_call: "bg-blue-100 text-blue-700",
    counseling: "bg-purple-100 text-purple-700",
    prayer: "bg-red-100 text-red-700",
    email: "bg-indigo-100 text-indigo-700",
    other: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {t("Operational Tasks", lang)}
          </h2>
          <p className="text-sm text-slate-500">{lang === "vi" ? "Quản lý nhiệm vụ, yêu cầu cầu nguyện và hoạt động chăm sóc" : "Manage tasks, prayer requests, and care activities"}</p>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prayer Requests Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              {lang === "vi" ? "Yêu cầu cầu nguyện" : "Prayer Requests"}
            </h3>
            <Button onClick={() => { setEditingPrayer(null); setShowPrayerForm(true); }} size="sm" className="bg-red-600 hover:bg-red-700">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input placeholder={lang === "vi" ? "Tìm kiếm..." : "Search..."} value={searchPrayer} onChange={(e) => setSearchPrayer(e.target.value)} className="pl-9 text-sm" />
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredPrayers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Heart className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs">{lang === "vi" ? "Chưa có yêu cầu" : "No requests"}</p>
              </div>
            ) : (
              filteredPrayers.map((prayer) => (
                <Card key={prayer.id} className="border-red-100">
                  <CardContent className="p-3 space-y-2">
                    <p className="font-medium text-sm text-slate-900">{prayer.contact_name}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{prayer.request_content}</p>
                    <div className="flex gap-2 items-center">
                      <Badge className={statusColors[prayer.status] || "bg-slate-100 text-slate-600"} variant="outline" className="text-xs py-0">
                        {prayer.status}
                      </Badge>
                      <button onClick={() => { setEditingPrayer(prayer); setShowPrayerForm(true); }} className="text-xs text-slate-400 hover:text-slate-600"><Edit className="w-3 h-3" /></button>
                      <button onClick={() => deletePrayerMutation.mutate(prayer.id)} className="text-xs text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Care Activities Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              {lang === "vi" ? "Hoạt động chăm sóc" : "Care Activities"}
            </h3>
            <Button onClick={() => { setEditingActivity(null); setShowActivityForm(true); }} size="sm" className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input placeholder={lang === "vi" ? "Tìm kiếm..." : "Search..."} value={searchActivity} onChange={(e) => setSearchActivity(e.target.value)} className="pl-9 text-sm" />
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs">{lang === "vi" ? "Chưa có hoạt động" : "No activities"}</p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <Card key={activity.id} className="border-amber-100">
                  <CardContent className="p-3 space-y-2">
                    <p className="font-medium text-sm text-slate-900">{activity.contact_name}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{activity.notes}</p>
                    <div className="flex gap-2 items-center flex-wrap">
                      <Badge className={activityTypeColors[activity.activity_type] || "bg-slate-100 text-slate-600"} variant="outline" className="text-xs py-0">
                        {activity.activity_type}
                      </Badge>
                      <span className="text-xs text-slate-400">{format(new Date(activity.activity_date), "MMM d")}</span>
                      <button onClick={() => { setEditingActivity(activity); setShowActivityForm(true); }} className="text-xs text-slate-400 hover:text-slate-600 ml-auto"><Edit className="w-3 h-3" /></button>
                      <button onClick={() => deleteActivityMutation.mutate(activity.id)} className="text-xs text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Tasks Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-violet-500" />
              {t("Tasks", lang)}
            </h3>
            <Button onClick={() => { setEditing(null); setShowForm(true); }} size="sm" className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input placeholder={lang === "vi" ? "Tìm kiếm..." : "Search..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-sm" />
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs">{lang === "vi" ? "Chưa có nhiệm vụ" : "No tasks"}</p>
              </div>
            ) : (
              filtered.map((task) => {
                const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <Card key={task.id} className="border-violet-100">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
                        <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-slate-400" : "text-slate-900"}`}>{task.title}</p>
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <Badge className={PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium} variant="outline" className="text-xs py-0">
                          {task.priority}
                        </Badge>
                        {task.due_date && <span className="text-xs text-slate-400">{task.due_date}</span>}
                        <button onClick={() => { setEditing(task); setShowForm(true); }} className="text-xs text-slate-400 hover:text-slate-600 ml-auto"><Edit className="w-3 h-3" /></button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>



      {showForm && (
        <TaskForm
          open={showForm}
          onOpenChange={setShowForm}
          task={editing}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ["tasks"] }); }}
        />
      )}

      <PrayerRequestForm
        open={showPrayerForm}
        onOpenChange={setShowPrayerForm}
        prayerRequest={editingPrayer}
        onSaved={() => {
          setShowPrayerForm(false);
          setEditingPrayer(null);
          queryClient.invalidateQueries({ queryKey: ["prayer_requests"] });
        }}
      />

      <PastoralActivityForm
        open={showActivityForm}
        onOpenChange={setShowActivityForm}
        activity={editingActivity}
        onSaved={() => {
          setShowActivityForm(false);
          setEditingActivity(null);
          queryClient.invalidateQueries({ queryKey: ["pastoral_activities"] });
        }}
      />
    </div>
  );
}