import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HandHeart } from "lucide-react";
import { useLang } from "@/components/i18n/LanguageContext";

const MONTH_LABELS = {
  en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  vi: ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"],
  fr: ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"],
};

// Default monthly budget (can be adjusted)
const MONTHLY_BUDGET = 16000;

export default function DashboardOfferingChart({ records, year }) {
  const { lang } = useLang();
  const months = MONTH_LABELS[lang] || MONTH_LABELS.en;

  const monthly = months.map((label, idx) => {
    const monthRecs = records.filter(r => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === idx && r.tithe_cad;
    });
    const total = monthRecs.reduce((s, r) => s + (r.tithe_cad || 0), 0);
    return { label, total, budget: MONTHLY_BUDGET };
  });

  const title = lang === "vi" ? "Dâng hiến theo tháng vs Ngân sách" : lang === "fr" ? "Dîmes mensuelles vs Budget" : "Monthly Tithes vs Budget";

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <HandHeart className="w-4 h-4 text-violet-500" /> {title} {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthly} barSize={14} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <YAxis hide />
            <Tooltip
              formatter={(v, name) => [`$${(v/1000).toFixed(1)}k`, name === "total" ? (lang === "vi" ? "Dâng hiến" : "Offering") : (lang === "vi" ? "Ngân sách" : "Budget")]}
              contentStyle={{ borderRadius: 8, border: "none" }}
            />
            <Bar dataKey="budget" fill="#e2e8f0" radius={[4,4,0,0]} name="budget" />
            <Bar dataKey="total" radius={[4,4,0,0]} name="total">
              {monthly.map((entry, i) => (
                <Cell key={i} fill={entry.total >= entry.budget ? "#10b981" : entry.total > 0 ? "#8b5cf6" : "#e2e8f0"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center text-xs text-slate-500 mt-1">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-200 inline-block" /> {lang === "vi" ? "Ngân sách" : "Budget"}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-500 inline-block" /> {lang === "vi" ? "Dâng hiến" : "Offering"}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> {lang === "vi" ? "Đạt mục tiêu" : "Met goal"}</span>
        </div>
      </CardContent>
    </Card>
  );
}