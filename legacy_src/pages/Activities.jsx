import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, Plus, Search, Trash2, Pencil, Phone, Mail, Calendar, FileText, CheckSquare, Circle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "@/components/shared/EmptyState";
import ActivityForm from "../components/activities/ActivityForm";
import { format } from "date-fns";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

const TYPE_ICONS = { call: Phone, email: Mail, meeting: Calendar, note: FileText, task: CheckSquare };
const TYPE_COLORS = {
  call: "bg-emerald-50 text-emerald-600",
  email: "bg-blue-50 text-blue-600",
  meeting: "bg-violet-50 text-violet-600",
  note: "bg-amber-50 text-amber-600",
  task: "bg-rose-50 text-rose-600",
};

export default function Activities() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();
  const { lang } = useLang();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Activity.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Activity.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities"] }),
  });

  const filtered = activities.filter(a => {
    const matchSearch = a.subject?.toLowerCase().includes(search.toLowerCase()) || a.contact_name?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder={t("Search activities...", lang)} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Types", lang)}</SelectItem>
              <SelectItem value="call">{t("Call", lang)}</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">{t("Meeting", lang)}</SelectItem>
              <SelectItem value="note">{t("Note", lang)}</SelectItem>
              <SelectItem value="task">{t("Task", lang)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> {t("Log Activity", lang)}
        </Button>
      </div>

      {activities.length === 0 && !isLoading ? (
        <EmptyState icon={Activity} title={t("No activities yet (empty)", lang)} description={t("No activities yet", lang)} actionLabel={t("Log Activity", lang)} onAction={() => setFormOpen(true)} />
      ) : (
        <div className="space-y-3">
          {filtered.map(activity => {
            const Icon = TYPE_ICONS[activity.type] || FileText;
            const colorClass = TYPE_COLORS[activity.type] || "bg-slate-50 text-slate-600";
            return (
              <div key={activity.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-4 crm-card">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{activity.subject}</p>
                      <div className="flex flex-wrap gap-x-3 mt-1">
                        {activity.contact_name && <span className="text-xs text-slate-500">{activity.contact_name}</span>}
                        <span className="text-xs text-slate-400">{format(new Date(activity.created_date), "MMM d, yyyy · h:mm a")}</span>
                        {activity.due_date && <span className="text-xs text-amber-600">{t("Due", lang)}: {format(new Date(activity.due_date), "MMM d")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {activity.type === "task" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateMutation.mutate({ id: activity.id, data: { completed: !activity.completed } })}>
                          {activity.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-300" />}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(activity); setFormOpen(true); }}>
                        <Pencil className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(activity.id)}>
                        <Trash2 className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                  {activity.description && <p className="text-sm text-slate-500 mt-1">{activity.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ActivityForm open={formOpen} onOpenChange={setFormOpen} activity={editing} onSaved={() => { setFormOpen(false); setEditing(null); }} />
    </div>
  );
}