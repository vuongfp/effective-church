import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Search, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "../components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "../components/shared/StatusBadge";
import AccountForm from "../components/accounts/AccountForm";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

export default function Accounts() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();
  const { lang } = useLang();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => base44.entities.Account.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Account.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });

  const filtered = accounts.filter(a => {
    const term = search.toLowerCase();
    return a.name?.toLowerCase().includes(term) || a.industry?.toLowerCase().includes(term);
  });

  const columns = useMemo(() => [
    {
      key: "name",
      label: t("Company", lang),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-xs font-bold text-violet-600">
            {row.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            {row.website && <p className="text-xs text-slate-500">{row.website}</p>}
          </div>
        </div>
      ),
    },
    { key: "industry", label: t("Industry", lang), render: (row) => <span className="text-slate-600 capitalize">{row.industry?.replace(/_/g, " ") || "—"}</span> },
    { key: "size", label: t("Size", lang), render: (row) => <span className="text-slate-600">{row.size || "—"}</span> },
    { key: "type", label: t("Type", lang), render: (row) => <StatusBadge status={row.type || "prospect"} /> },
    {
      key: "revenue",
      label: t("Est. Revenue", lang),
      render: (row) => <span className="text-slate-600">{row.estimated_revenue ? `$${row.estimated_revenue.toLocaleString()}` : "—"}</span>,
    },
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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t("Search accounts...", lang)} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> {t("Add Account", lang)}
        </Button>
      </div>

      {accounts.length === 0 && !isLoading ? (
        <EmptyState icon={Building2} title={t("No accounts yet", lang)} description={t("No accounts yet", lang)} actionLabel={t("Add Account", lang)} onAction={() => setFormOpen(true)} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <DataTable columns={columns} data={filtered} isLoading={isLoading} />
        </div>
      )}

      <AccountForm open={formOpen} onOpenChange={setFormOpen} account={editing} onSaved={() => { setFormOpen(false); setEditing(null); }} />
    </div>
  );
}