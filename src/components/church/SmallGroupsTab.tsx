"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Plus, Search, Trash2, Pencil, X, Save, Loader2, UserPlus, Check } from "lucide-react";
import { useLang } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Member, Group } from "@/types";



const TYPE_COLORS: Record<string, string> = {
  segment: "bg-indigo-500",
  custom: "bg-violet-500",
  vip: "bg-amber-500",
  ministry: "bg-emerald-500",
};

const TYPE_BADGE: Record<string, string> = {
  segment: "bg-indigo-100 text-indigo-700",
  custom: "bg-violet-100 text-violet-700",
  vip: "bg-amber-100 text-amber-700",
  ministry: "bg-emerald-100 text-emerald-700",
};

const TYPES = ["custom", "segment", "ministry", "vip"];

/* ── Group Edit/Create Modal ──────────────────────────────────────── */
function GroupModal({
  group,
  allMembers,
  onClose,
  onSaved,
}: {
  group: Partial<Group> | null;
  allMembers: Member[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { lang } = useLang();
  const supabase = createClient();
  const isEdit = !!group?.id;

  const [form, setForm] = useState({ name: "", description: "", type: "custom" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Member picker state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [memberSearch, setMemberSearch] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Load group info and existing members when opened
  useEffect(() => {
    if (group) {
      setForm({ name: group.name || "", description: group.description || "", type: group.type || "custom" });
    } else {
      setForm({ name: "", description: "", type: "custom" });
      setSelectedIds(new Set());
    }

    if (group?.id) {
      setLoadingMembers(true);
      supabase
        .from("group_members")
        .select("member_id")
        .eq("group_id", group.id)
        .then(({ data }) => {
          setSelectedIds(new Set((data || []).map((r: any) => r.member_id)));
          setLoadingMembers(false);
        });
    }
  }, [group]);

  const toggleMember = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredMembers = useMemo(() => {
    const q = memberSearch.toLowerCase().trim();
    if (!q) return allMembers;
    return allMembers.filter(m =>
      m.first_name.toLowerCase().includes(q) ||
      m.last_name.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    );
  }, [allMembers, memberSearch]);

  const selectedMembers = allMembers.filter(m => m.id && selectedIds.has(m.id));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true); setErr(null);

    let groupId = group?.id;

    // Create/Update group
    if (groupId) {
      const { error } = await supabase.from("groups")
        .update({ name: form.name.trim(), description: form.description || null, type: form.type })
        .eq("id", groupId);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      groupId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const { error } = await supabase.from("groups")
        .insert([{ id: groupId, name: form.name.trim(), description: form.description || null, type: form.type, member_count: 0 }]);
      if (error) { setErr(error.message); setSaving(false); return; }
    }

    // Sync group_members: delete all, then re-insert selected
    await supabase.from("group_members").delete().eq("group_id", groupId);
    if (selectedIds.size > 0) {
      const rows = [...selectedIds].map(member_id => ({ group_id: groupId!, member_id }));
      const { error } = await supabase.from("group_members").insert(rows);
      if (error) { setErr(error.message); setSaving(false); return; }
    }

    // Sync member_count
    await supabase.from("groups").update({ member_count: selectedIds.size }).eq("id", groupId!);

    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{isEdit ? t("Edit Group", lang) : t("New Group", lang)}</h2>
            {isEdit && <p className="text-sm text-slate-400">{group?.name}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Group Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("Group Name", lang)} *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("Description", lang)}</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("Type", lang)}</label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(typeStr => (
                <button key={typeStr} type="button" onClick={() => setForm(f => ({ ...f, type: typeStr }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                    ${form.type === typeStr ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500 hover:border-indigo-300"}`}>
                  {typeStr.charAt(0).toUpperCase() + typeStr.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-slate-100" />

          {/* Members section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" /> {t("Members", lang)}
              </label>
              <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                {selectedIds.size} {t("selected", lang)}
              </span>
            </div>

            {/* Selected chips */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedMembers.map(m => (
                  <span key={m.id} className="flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                    {m.last_name} {m.first_name}
                    <button type="button" onClick={() => m.id && toggleMember(m.id)} className="ml-0.5 hover:text-red-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search + list */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="relative border-b border-slate-200">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder={t("Search members to add...", lang)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:bg-indigo-50/40 transition-colors"
                />
              </div>
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> {t("Loading members...", lang)}
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  {filteredMembers.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">{t("No members found", lang)}</p>
                  ) : filteredMembers.map(m => {
                    const checked = m.id ? selectedIds.has(m.id) : false;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => m.id && toggleMember(m.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                          ${checked ? "bg-indigo-50/60 hover:bg-indigo-100/60" : "hover:bg-slate-50"}`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
                          ${checked ? "bg-indigo-600 border-indigo-600" : "border-slate-300"}`}>
                          {checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {m.last_name} {m.first_name}
                            {m.is_kid && <span className="ml-1.5 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Kid</span>}
                          </p>
                          {m.email && <p className="text-xs text-slate-400 truncate">{m.email}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {err && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors">{t("Cancel", lang)}</button>
          <button onClick={handleSave as any} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t("Saving...", lang) : t("Save Changes", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main SmallGroupsTab Component ─────────────────────────────────────── */
interface SmallGroupsTabProps {
  contacts: Member[];
}

export default function SmallGroupsTab({ contacts }: SmallGroupsTabProps) {
  const supabase = createClient();
  const { lang } = useLang();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalGroup, setModalGroup] = useState<Partial<Group> | null | undefined>(undefined);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("groups").select("*").order("name");
    setGroups(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const deleteGroup = async (g: Group) => {
    if (!confirm(`${t("Delete group", lang)} "${g.name}"?`)) return;
    await supabase.from("groups").delete().eq("id", g.id);
    fetchGroups();
  };

  const filtered = groups.filter(g => !search.trim() || g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Search groups...", lang)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <Button onClick={() => setModalGroup({})}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> {t("New Group", lang)}
        </Button>
      </div>

      {/* Summary */}
      <div className="flex gap-3 text-xs text-slate-500 flex-wrap">
        <span className="bg-slate-100 px-3 py-1 rounded-full">{groups.length} {t("groups total", lang)}</span>
        {Object.entries(TYPE_BADGE).map(([type, cls]) => {
          const cnt = groups.filter(g => g.type === type).length;
          return cnt > 0 ? <span key={type} className={`px-3 py-1 rounded-full font-medium ${cls}`}>{cnt} {type}</span> : null;
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Users className="w-12 h-12 opacity-30" />
          <p className="text-sm font-medium">{search ? t("No groups match your search.", lang) : t("No groups yet.", lang)}</p>
          {!search && <button onClick={() => setModalGroup({})} className="mt-1 text-sm text-indigo-600 hover:underline">{t("Create the first group", lang)}</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(g => (
            <div key={g.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[g.type ?? "custom"] ?? "bg-slate-400"}`}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm leading-snug">{g.name}</p>
                    {g.type && (
                      <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[g.type] ?? "bg-slate-100 text-slate-500"}`}>
                        {g.type}
                      </span>
                    )}
                  </div>
                </div>
                {g.description && <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{g.description}</p>}
              </div>
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {(g.member_count ?? 0)} {t("members", lang)}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setModalGroup(g)}
                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title={t("Edit", lang)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteGroup(g)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title={t("Delete", lang)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Group modal */}
      {modalGroup !== undefined && (
        <GroupModal
          group={modalGroup}
          allMembers={contacts}
          onClose={() => setModalGroup(undefined)}
          onSaved={fetchGroups}
        />
      )}
    </div>
  );
}