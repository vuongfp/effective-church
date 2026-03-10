import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "../shared/StatusBadge";

export default function PipelineBoard({ stages, opportunities, onStageChange, onEdit, onAddToStage }) {
  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-4" style={{ minHeight: "calc(100vh - 220px)" }}>
        {stages.map(stage => {
          const stageOpps = opportunities.filter(o => o.stage === stage.key);
          const total = stageOpps.reduce((s, o) => s + (o.value || 0), 0);

          return (
            <div
              key={stage.key}
              className="w-[280px] flex flex-col bg-slate-100/60 rounded-xl"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const oppId = e.dataTransfer.getData("oppId");
                if (oppId) onStageChange(oppId, stage.key);
              }}
            >
              {/* Column header */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span className="text-sm font-semibold text-slate-700">{stage.label}</span>
                  <span className="text-xs text-slate-400 bg-white rounded-full px-2 py-0.5">{stageOpps.length}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAddToStage(stage.key)}>
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </div>

              {/* Total */}
              <div className="px-3 pb-2">
                <p className="text-xs text-slate-500">${total.toLocaleString()}</p>
              </div>

              {/* Cards */}
              <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
                {stageOpps.map(opp => (
                  <div
                    key={opp.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("oppId", opp.id)}
                    onClick={() => onEdit(opp)}
                    className="bg-white rounded-lg p-3 border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm font-medium text-slate-900 mb-1">{opp.title}</p>
                    {opp.account_name && <p className="text-xs text-slate-500 mb-2">{opp.account_name}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        {opp.value ? `$${opp.value.toLocaleString()}` : "—"}
                      </span>
                      {opp.probability != null && (
                        <span className="text-xs text-slate-400">{opp.probability}%</span>
                      )}
                    </div>
                    {opp.expected_close_date && (
                      <p className="text-xs text-slate-400 mt-1">Close: {opp.expected_close_date}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}