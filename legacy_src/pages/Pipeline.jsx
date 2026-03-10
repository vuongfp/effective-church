import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "../components/shared/EmptyState";
import PipelineBoard from "../components/pipeline/PipelineBoard";
import OpportunityForm from "../components/pipeline/OpportunityForm";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

const STAGES = [
  { key: "lead", label: "Lead", color: "bg-slate-400" },
  { key: "qualified", label: "Qualified", color: "bg-blue-400" },
  { key: "proposal", label: "Proposal", color: "bg-violet-400" },
  { key: "negotiation", label: "Negotiation", color: "bg-amber-400" },
  { key: "closed_won", label: "Closed Won", color: "bg-emerald-400" },
  { key: "closed_lost", label: "Closed Lost", color: "bg-rose-400" },
];

export default function Pipeline() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [initialStage, setInitialStage] = useState("lead");
  const queryClient = useQueryClient();
  const { lang } = useLang();

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => base44.entities.Opportunity.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Opportunity.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["opportunities"] }),
  });

  const handleStageChange = (oppId, newStage) => {
    updateMutation.mutate({ id: oppId, data: { stage: newStage } });
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">
            {opportunities.length} {t("deals", lang)} · ${opportunities.filter(o => !["closed_won", "closed_lost"].includes(o.stage)).reduce((s, o) => s + (o.value || 0), 0).toLocaleString()} {t("in pipeline", lang)}
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setInitialStage("lead"); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> {t("Add Deal", lang)}
        </Button>
      </div>

      {opportunities.length === 0 && !isLoading ? (
        <EmptyState icon={TrendingUp} title={t("No deals yet", lang)} description={t("No deals yet", lang)} actionLabel={t("Add Deal", lang)} onAction={() => setFormOpen(true)} />
      ) : (
        <PipelineBoard
          stages={STAGES}
          opportunities={opportunities}
          onStageChange={handleStageChange}
          onEdit={(opp) => { setEditing(opp); setFormOpen(true); }}
          onAddToStage={(stage) => { setInitialStage(stage); setEditing(null); setFormOpen(true); }}
        />
      )}

      <OpportunityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        opportunity={editing}
        initialStage={initialStage}
        onSaved={() => { setFormOpen(false); setEditing(null); }}
      />
    </div>
  );
}