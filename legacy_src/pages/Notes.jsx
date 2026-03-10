import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Search, Trash2, Pencil, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "../components/shared/EmptyState";
import NoteForm from "../components/notes/NoteForm";
import { format } from "date-fns";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

const ENTITY_COLORS = {
  contact: "bg-indigo-50 text-indigo-600",
  account: "bg-violet-50 text-violet-600",
  opportunity: "bg-emerald-50 text-emerald-600",
  ticket: "bg-rose-50 text-rose-600",
};

export default function Notes() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();
  const { lang } = useLang();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: () => base44.entities.Note.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const pinMutation = useMutation({
    mutationFn: ({ id, pinned }) => base44.entities.Note.update(id, { pinned }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const filtered = notes
    .filter(n => {
      const matchFilter = filter === "all" || n.entity_type === filter || (filter === "pinned" && n.pinned);
      const matchSearch = n.content?.toLowerCase().includes(search.toLowerCase()) || n.entity_name?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder={t("Search notes...", lang)} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Notes", lang)}</SelectItem>
              <SelectItem value="pinned">{t("📌 Pinned", lang)}</SelectItem>
              <SelectItem value="contact">Contacts</SelectItem>
              <SelectItem value="account">Accounts</SelectItem>
              <SelectItem value="opportunity">Opportunities</SelectItem>
              <SelectItem value="ticket">Tickets</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> {t("Add Note", lang)}
        </Button>
      </div>

      {notes.length === 0 && !isLoading ? (
        <EmptyState icon={FileText} title={t("No notes yet", lang)} description={t("No notes yet", lang)} actionLabel={t("Add Note", lang)} onAction={() => setFormOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(note => {
            const colorClass = ENTITY_COLORS[note.entity_type] || "bg-slate-50 text-slate-600";
            return (
              <div key={note.id} className={`bg-white rounded-xl border p-4 crm-card relative ${note.pinned ? "border-amber-200 bg-amber-50/20" : "border-slate-200"}`}>
                {note.pinned && <Pin className="absolute top-3 right-3 w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                    {note.entity_type}
                  </span>
                  {note.entity_name && <span className="text-xs text-slate-500 truncate">{note.entity_name}</span>}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{format(new Date(note.created_date), "MMM d, yyyy")}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => pinMutation.mutate({ id: note.id, pinned: !note.pinned })}>
                      <Pin className={`w-3.5 h-3.5 ${note.pinned ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(note); setFormOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(note.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NoteForm open={formOpen} onOpenChange={setFormOpen} note={editing} onSaved={() => { setFormOpen(false); setEditing(null); }} />
    </div>
  );
}