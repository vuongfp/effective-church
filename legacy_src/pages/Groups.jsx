import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search, Trash2, Pencil, UserPlus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "../components/shared/EmptyState";
import GroupForm from "../components/groups/GroupForm";
import GroupMembersModal from "../components/groups/GroupMembersModal";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

const TYPE_COLORS = {
  segment: "bg-indigo-100 text-indigo-700",
  industry: "bg-violet-100 text-violet-700",
  region: "bg-emerald-100 text-emerald-700",
  vip: "bg-amber-100 text-amber-700",
  lead_source: "bg-sky-100 text-sky-700",
  custom: "bg-slate-100 text-slate-700",
};

const GROUP_COLORS = [
  "#818cf8", "#34d399", "#fbbf24", "#f87171", "#60a5fa", "#a78bfa", "#f472b6", "#fb923c"
];

export default function Groups() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [membersGroup, setMembersGroup] = useState(null);
  const queryClient = useQueryClient();
  const { lang } = useLang();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: () => base44.entities.Group.list("-created_date"),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => base44.entities.Contact.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Group.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const filtered = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t("Search groups...", lang)} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> {t("New Group", lang)}
        </Button>
      </div>

      {groups.length === 0 && !isLoading ? (
        <EmptyState icon={Users} title={t("No groups yet", lang)} description={t("No groups yet", lang)} actionLabel={t("New Group", lang)} onAction={() => setFormOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(group => {
            const memberCount = group.member_ids?.length || 0;
            const typeClass = TYPE_COLORS[group.type] || TYPE_COLORS.custom;
            return (
              <div key={group.id} className="bg-white rounded-xl border border-slate-200 p-5 crm-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: group.color || "#818cf8" + "22" }}>
                      <Tag className="w-5 h-5" style={{ color: group.color || "#818cf8" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{group.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeClass}`}>
                        {group.type?.replace(/_/g, " ") || "custom"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(group); setFormOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(group.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                  </div>
                </div>

                {group.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{group.description}</p>
                )}

                {/* Member avatars */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="flex -space-x-2">
                    {(group.member_ids || []).slice(0, 5).map((cid, i) => {
                      const contact = contacts.find(c => c.id === cid);
                      return contact ? (
                        <div key={cid} className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-indigo-600">
                          {contact.first_name?.[0]}{contact.last_name?.[0]}
                        </div>
                      ) : null;
                    })}
                    {memberCount > 5 && (
                      <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500">
                        +{memberCount - 5}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">{memberCount} {t("members contacts", lang)}</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setMembersGroup(group)}>
                      <UserPlus className="w-3 h-3 mr-1" /> {t("Manage", lang)}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GroupForm open={formOpen} onOpenChange={setFormOpen} group={editing} groupColors={GROUP_COLORS} onSaved={() => { setFormOpen(false); setEditing(null); }} />
      {membersGroup && (
        <GroupMembersModal group={membersGroup} contacts={contacts} onClose={() => setMembersGroup(null)} />
      )}
    </div>
  );
}