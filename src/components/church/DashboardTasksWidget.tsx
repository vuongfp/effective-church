import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useLang } from "@/components/i18n/LanguageContext";

const PRIORITY_ORDER = { urgent: 4, high: 3, medium: 2, low: 1 };
const PRIORITY_COLORS = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-slate-100 text-slate-500",
};
const STATUS_ICONS = {
  done: CheckCircle2,
  in_progress: Loader2,
  pending: Clock,
};
const STATUS_COLORS = {
  done: "text-emerald-500",
  in_progress: "text-blue-500",
  pending: "text-amber-500",
};

export default function DashboardTasksWidget({ tasks }: { tasks: any[] }) {
  const { lang } = useLang();

  const topTasks = [...tasks]
    .filter(t => t.status !== "done")
    .sort((a, b) => (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 2) - (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 2))
    .slice(0, 6);

  const title = lang === "vi" ? "Nhiệm vụ ưu tiên cao" : "High Priority Tasks";
  const emptyMsg = lang === "vi" ? "Không có nhiệm vụ nào đang chờ" : "No pending tasks";

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topTasks.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">{emptyMsg}</p>
        ) : (
          <div className="space-y-2">
            {topTasks.map(task => {
              const Icon = STATUS_ICONS[task.status as keyof typeof STATUS_ICONS] || Clock;
              return (
                <div key={task.id} className="flex items-start gap-2 py-1.5 border-b border-slate-50 last:border-0">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS] || "text-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                    {task.due_date && <p className="text-xs text-slate-400">📅 {task.due_date}</p>}
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium}`}>
                    {task.priority}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}