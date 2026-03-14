import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color?: "indigo" | "emerald" | "amber" | "rose" | "violet" | "sky";
}

export default function StatCard({ label, value, icon: Icon, trend, trendLabel, color = "indigo" }: StatCardProps) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
    sky: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 crm-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {trend >= 0 ? "+" : ""}{trend}%
              </span>
              {trendLabel && <span className="text-xs text-slate-400">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color] || colors.indigo}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}