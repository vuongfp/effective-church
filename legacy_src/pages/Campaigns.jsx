import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Search, Trash2, Pencil, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "../components/shared/EmptyState";
import StatusBadge from "../components/shared/StatusBadge";
import CampaignForm from "../components/campaigns/CampaignForm";
import { format } from "date-fns";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

export default function Campaigns() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();
  const { lang } = useLang();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => base44.entities.Campaign.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Campaign.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  const filtered = campaigns.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t("Search campaigns...", lang)} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> {t("New Campaign", lang)}
        </Button>
      </div>

      {campaigns.length === 0 && !isLoading ? (
        <EmptyState icon={Megaphone} title={t("No campaigns yet", lang)} description={t("No campaigns yet", lang)} actionLabel={t("New Campaign", lang)} onAction={() => setFormOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(campaign => (
            <div key={campaign.id} className="bg-white rounded-xl border border-slate-200 p-5 crm-card">
              <div className="flex items-start justify-between mb-3">
                <StatusBadge status={campaign.status || "draft"} />
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(campaign); setFormOpen(true); }}>
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(campaign.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{campaign.name}</h3>
              <p className="text-xs text-slate-500 capitalize mb-3">{campaign.type?.replace(/_/g, " ")}</p>
              {campaign.start_date && (
                <p className="text-xs text-slate-400 mb-3">
                  {format(new Date(campaign.start_date), "MMM d")}
                  {campaign.end_date && ` → ${format(new Date(campaign.end_date), "MMM d, yyyy")}`}
                </p>
              )}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">{campaign.leads_generated || 0} {t("Leads", lang)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">{campaign.conversions || 0} {t("Conversions", lang)}</span>
                </div>
                {campaign.budget && (
                  <span className="text-xs text-slate-500 ml-auto">${campaign.budget.toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CampaignForm open={formOpen} onOpenChange={setFormOpen} campaign={editing} onSaved={() => { setFormOpen(false); setEditing(null); }} />
    </div>
  );
}