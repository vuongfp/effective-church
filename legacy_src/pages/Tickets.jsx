import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TicketCheck, Plus, Search, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable from "../components/shared/DataTable";
import EmptyState from "../components/shared/EmptyState";
import StatusBadge from "../components/shared/StatusBadge";
import TicketForm from "../components/tickets/TicketForm";
import { format } from "date-fns";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

export default function Tickets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();
  const { lang } = useLang();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => base44.entities.Ticket.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ticket.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
  });

  const filtered = tickets.filter(t => {
    const matchSearch = t.subject?.toLowerCase().includes(search.toLowerCase()) || t.contact_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = useMemo(() => [
    {
      key: "subject",
      label: t("Subject", lang),
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.subject}</p>
          <p className="text-xs text-slate-500 truncate max-w-xs">{row.description}</p>
        </div>
      ),
    },
    { key: "contact_name", label: t("Contact", lang), render: (row) => <span className="text-slate-600">{row.contact_name || "—"}</span> },
    { key: "priority", label: t("Priority", lang), render: (row) => <StatusBadge status={row.priority || "medium"} /> },
    { key: "status", label: t("Status", lang), render: (row) => <StatusBadge status={row.status || "open"} /> },
    { key: "category", label: t("Category", lang), render: (row) => <span className="text-slate-600 capitalize text-xs">{row.category?.replace(/_/g, " ") || "—"}</span> },
    { key: "created", label: t("Created", lang), render: (row) => <span className="text-xs text-slate-500">{format(new Date(row.created_date), "MMM d, yyyy")}</span> },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditing(row); setFormOpen(true); }}>
            <Pencil className="w-4 h-4 text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(row.id); }}>
            <Trash2 className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      ),
    },
  ], [lang, setEditing, setFormOpen, deleteMutation]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder={t("Search tickets...", lang)} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Status", lang)}</SelectItem>
              <SelectItem value="open">{t("Open", lang)}</SelectItem>
              <SelectItem value="in_progress">{t("In Progress", lang)}</SelectItem>
              <SelectItem value="waiting">{t("Waiting", lang)}</SelectItem>
              <SelectItem value="resolved">{t("Resolved", lang)}</SelectItem>
              <SelectItem value="closed">{t("Closed", lang)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> {t("New Ticket", lang)}
        </Button>
      </div>

      {tickets.length === 0 && !isLoading ? (
        <EmptyState icon={TicketCheck} title={t("No tickets yet", lang)} description={t("No tickets yet", lang)} actionLabel={t("New Ticket", lang)} onAction={() => setFormOpen(true)} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <DataTable columns={columns} data={filtered} isLoading={isLoading} />
        </div>
      )}

      <TicketForm open={formOpen} onOpenChange={setFormOpen} ticket={editing} onSaved={() => { setFormOpen(false); setEditing(null); }} />
    </div>
  );
}