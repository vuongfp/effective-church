import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search, Trash2, Pencil, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "../components/shared/DataTable";
import EmptyState from "../components/shared/EmptyState";
import StatusBadge from "../components/shared/StatusBadge";
import ContactForm from "../components/contacts/ContactForm";
import ContactCSVImport from "../components/contacts/ContactCSVImport";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";
import { useEntityPermissions } from "@/components/rbac/useEntityPermissions";
import { ActionGuard } from "@/components/rbac/PermissionGuard";
import { useDataAccessFilter } from "@/components/rbac/DataAccessFilter";

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const { lang } = useLang();
  const { canView, canCreate, canEdit, canDelete } = useEntityPermissions("Contact");
  const { filterRecordsForDisplay } = useDataAccessFilter();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allContacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => base44.entities.Contact.list("-created_date"),
  });

  // Filter contacts based on user's role and confidential_roles
  const contacts = allContacts.filter(c => {
    if (user?.role === "admin") return true;
    if (!c.confidential_roles || c.confidential_roles.length === 0) return true;
    return c.confidential_roles.includes(user?.role);
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contacts"] }),
  });

  const filtered = contacts.filter(c => {
    const term = search.toLowerCase();
    return (
      c.first_name?.toLowerCase().includes(term) ||
      c.last_name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.company?.toLowerCase().includes(term)
    );
  });

  const exportCSV = () => {
    const headers = ["first_name","last_name","email","phone","company","role","address","relationship","favorite_channel","groups","status","notes"];
    const rows = [headers.join(",")];
    filtered.forEach(c => {
      rows.push(headers.map(h => {
        let v = c[h] ?? "";
        if (Array.isArray(v)) v = v.join(";");
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(","));
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "contacts.csv"; a.click();
  };

  const columns = useMemo(() => [
    {
      key: "name",
      label: t("Name", lang),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-semibold text-indigo-600">
            {row.first_name?.[0]}{row.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.first_name} {row.last_name}</p>
            <p className="text-xs text-slate-500">{row.role || ""}</p>
          </div>
        </div>
      ),
    },
    { key: "email", label: t("Email", lang), render: (row) => <span className="text-slate-600">{row.email}</span> },
    { key: "phone", label: t("Phone", lang), render: (row) => <span className="text-slate-600">{row.phone || "—"}</span> },
    { key: "company", label: t("Company", lang), render: (row) => <span className="text-slate-600">{row.company || "—"}</span> },
    {
      key: "relationship",
      label: "Relationship",
      render: (row) => row.relationship
        ? <span className="capitalize text-slate-600 text-sm">{row.relationship}</span>
        : <span className="text-slate-300">—</span>,
    },
    {
      key: "favorite_channel",
      label: "Channel",
      render: (row) => row.favorite_channel
        ? <span className="capitalize text-slate-600 text-sm">{row.favorite_channel}</span>
        : <span className="text-slate-300">—</span>,
    },
    {
      key: "groups",
      label: "Groups",
      render: (row) => {
        const groups = Array.isArray(row.groups) ? row.groups : [];
        return groups.length > 0
          ? <div className="flex flex-wrap gap-1">{groups.map(g => <span key={g} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{g}</span>)}</div>
          : <span className="text-slate-300">—</span>;
      },
    },
    { key: "status", label: t("Status", lang), render: (row) => <StatusBadge status={row.status || "active"} /> },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <ActionGuard resourceType="entity" resourceName="Contact" action="edit">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditing(row); setFormOpen(true); }}>
              <Pencil className="w-4 h-4 text-slate-400" />
            </Button>
          </ActionGuard>
          <ActionGuard resourceType="entity" resourceName="Contact" action="delete">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(row.id); }}>
              <Trash2 className="w-4 h-4 text-slate-400" />
            </Button>
          </ActionGuard>
        </div>
      ),
    },
  ], [lang, filtered, setEditing, setFormOpen, deleteMutation]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t("Search contacts...", lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <ActionGuard resourceType="entity" resourceName="Contact" action="create">
            <Button variant="outline" onClick={() => setCsvOpen(true)}>
              <Upload className="w-4 h-4 mr-2" /> Import CSV
            </Button>
          </ActionGuard>
          <ActionGuard resourceType="entity" resourceName="Contact" action="create">
            <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" /> {t("Add Contact", lang)}
            </Button>
          </ActionGuard>
        </div>
      </div>

      {contacts.length === 0 && !isLoading ? (
        <EmptyState
          icon={Users}
          title={t("No contacts yet", lang)}
          description={t("Start building your network by adding your first contact.", lang)}
          actionLabel={t("Add Contact", lang)}
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <DataTable columns={columns} data={filtered} isLoading={isLoading} />
        </div>
      )}

      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editing}
        onSaved={() => { setFormOpen(false); setEditing(null); }}
      />
      <ContactCSVImport
        open={csvOpen}
        onOpenChange={setCsvOpen}
        onImported={() => queryClient.invalidateQueries({ queryKey: ["contacts"] })}
      />
    </div>
  );
}