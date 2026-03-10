import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GroupForm from "../components/groups/GroupForm";
import EmptyState from "../components/shared/EmptyState";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

const TYPE_LABELS = {
  en: { segment: "Segment", industry: "Industry", region: "Region", vip: "VIP", lead_source: "Source", custom: "Custom" },
  fr: { segment: "Segment", industry: "Secteur", region: "Région", vip: "VIP", lead_source: "Source", custom: "Personnalisé" },
  vi: { segment: "Phân khúc", industry: "Ngành", region: "Khu vực", vip: "VIP", lead_source: "Nguồn", custom: "Tùy chỉnh" },
};

const TYPE_COLORS = {
  segment: "bg-blue-50 text-blue-600",
  industry: "bg-emerald-50 text-emerald-600",
  region: "bg-amber-50 text-amber-600",
  vip: "bg-violet-50 text-violet-600",
  lead_source: "bg-rose-50 text-rose-600",
  custom: "bg-slate-50 text-slate-600",
};

const GROUP_COLORS = ["#818cf8", "#6366f1", "#4f46e5", "#4338ca", "#10b981", "#059669", "#0891b2", "#06b6d4", "#f59e0b", "#d97706"];


export default function ChurchGroups() {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: () => base44.entities.Group.list("-created_date"),
  });

  const filtered = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t("Nhóm / Tế bào", lang)}</h2>
          <p className="text-sm text-slate-500">{groups.length} {t("Nhóm / Tế bào", lang)}</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> {t("Tạo nhóm mới", lang)}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder={t("Tìm nhóm...", lang)} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm animate-pulse">
              <CardContent className="p-5 h-24 bg-slate-100 rounded-xl" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title={t("Chưa có nhóm nào", lang)} description={t("Tạo nhóm đầu tiên", lang)} actionLabel={t("Tạo nhóm mới", lang)} onAction={() => { setEditing(null); setShowForm(true); }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(g => (
            <Card key={g.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setEditing(g); setShowForm(true); }}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: g.color || "#e0e7ff" }}>
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{g.name}</p>
                    {g.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{g.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[g.type] || TYPE_COLORS.custom}`}>
                        {(TYPE_LABELS[lang] || TYPE_LABELS.en)[g.type] || g.type}
                      </span>
                      <span className="text-xs text-slate-400">{g.member_count || 0} {t("members", lang)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <GroupForm
          open={showForm}
          onOpenChange={setShowForm}
          group={editing}
          groupColors={GROUP_COLORS}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ["groups"] }); }}
        />
      )}
    </div>
  );
}