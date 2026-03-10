import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLang } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

export default function GroupMemberSelector({ open, onOpenChange, group, availableContacts, onMembersAdded }) {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState(new Set(group.member_ids || []));
  const queryClient = useQueryClient();

  const filtered = useMemo(() => {
    return availableContacts.filter(c => {
      const q = search.toLowerCase();
      return (
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    });
  }, [availableContacts, search]);

  const mutation = useMutation({
    mutationFn: (memberIds) => 
      base44.entities.Group.update(group.id, { member_ids: memberIds, member_count: memberIds.length }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onMembersAdded();
    },
  });

  const handleToggleMember = (contactId) => {
    const newSet = new Set(selectedMembers);
    if (newSet.has(contactId)) {
      newSet.delete(contactId);
    } else {
      newSet.add(contactId);
    }
    setSelectedMembers(newSet);
  };

  const handleSave = () => {
    mutation.mutate(Array.from(selectedMembers));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Add Members to", lang)} "{group.name}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {selectedMembers.size > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium">{t("Selected", lang)}:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {availableContacts.filter(c => selectedMembers.has(c.id)).map(member => (
                  <button
                    key={member.id}
                    onClick={() => handleToggleMember(member.id)}
                    className="text-xs px-2 py-1 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center gap-1"
                  >
                    {member.first_name} {member.last_name}
                    <span>×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t("Search members...", lang)}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {search && filtered.map(contact => (
              <button
                key={contact.id}
                onClick={() => handleToggleMember(contact.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                  selectedMembers.has(contact.id)
                    ? "bg-violet-50 border-violet-300"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    selectedMembers.has(contact.id)
                      ? "bg-violet-600 border-violet-600"
                      : "border-slate-300"
                  }`}
                >
                  {selectedMembers.has(contact.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {contact.first_name} {contact.last_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{contact.email}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            {selectedMembers.size} {t("members", lang)} {t("selected", lang)}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("Cancel", lang)}
          </Button>
          <Button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {mutation.isPending ? t("Saving...", lang) : t("Save", lang)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}