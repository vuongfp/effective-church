"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Users, Plus, Search, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import GroupForm from "../groups/GroupForm";
import EmptyState from "../shared/EmptyState";
import { useLang } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";
import GroupMemberSelector from "../groups/GroupMemberSelector";

const GROUP_COLORS = ["#818cf8", "#6366f1", "#4f46e5", "#4338ca", "#10b981", "#059669", "#0891b2", "#06b6d4", "#f59e0b", "#d97706"];

export default function SmallGroupsTab({ contacts }) {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const queryClient = useQueryClient();

  const supabase = createClient();
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: any) => {
      const { error } = await supabase.from('groups').delete().eq('id', groupId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const filtered = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()));

  const handleAddMember = (group) => {
    setSelectedGroup(group);
    setShowMemberSelector(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t("Tìm nhóm...", lang)}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="w-4 h-4 mr-2" /> {t("Tạo nhóm mới", lang)}
        </Button>
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
        <EmptyState
          icon={Users}
          title={t("Chưa có nhóm nào", lang)}
          description={t("Tạo nhóm đầu tiên", lang)}
          actionLabel={t("Tạo nhóm mới", lang)}
          onAction={() => { setEditing(null); setShowForm(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(g => (
            <Card key={g.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: g.color || "#e0e7ff" }}
                  >
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{g.name}</p>
                    {g.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{g.description}</p>}
                    <p className="text-xs text-slate-400 mt-1">{(g.member_ids?.length) || g.member_count || 0} {t("members", lang)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddMember(g)}
                    className="flex-1 h-8"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" /> {t("Add", lang)}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setEditing(g); setShowForm(true); }}
                    className="flex-1 h-8"
                  >
                    {t("Edit", lang)}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`${t("Delete", lang)} "${g.name}"?`)) {
                        deleteGroupMutation.mutate(g.id);
                      }
                    }}
                    className="h-8 px-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
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
          onSaved={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ["groups"] });
          }}
        />
      )}

      {showMemberSelector && selectedGroup && (
        <GroupMemberSelector
          open={showMemberSelector}
          onOpenChange={setShowMemberSelector}
          group={selectedGroup}
          availableContacts={contacts}
          onMembersAdded={() => {
            queryClient.invalidateQueries({ queryKey: ["groups"] });
            setShowMemberSelector(false);
          }}
        />
      )}
    </div>
  );
}