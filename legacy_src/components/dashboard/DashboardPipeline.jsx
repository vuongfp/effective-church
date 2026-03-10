import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useLang } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

const STAGES = [
  { key: "lead", label: "Lead" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "closed_won", label: "Won" },
  { key: "closed_lost", label: "Lost" },
];

const COLORS = {
  lead: "#94a3b8", qualified: "#60a5fa", proposal: "#a78bfa",
  negotiation: "#fbbf24", closed_won: "#34d399", closed_lost: "#f87171",
};

export default function DashboardPipeline({ opportunities }) {
  const { lang } = useLang();
  const data = STAGES.map(stage => ({
    name: t(stage.label, lang),
    value: opportunities.filter(o => o.stage === stage.key).reduce((s, o) => s + (o.value || 0), 0),
    count: opportunities.filter(o => o.stage === stage.key).length,
    color: COLORS[stage.key],
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">{t("Pipeline Overview", lang)}</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value) => [`$${value.toLocaleString()}`, "Value"]}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}