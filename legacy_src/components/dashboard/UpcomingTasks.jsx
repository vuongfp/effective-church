import React from "react";
import { CheckSquare, Circle, CheckCircle2 } from "lucide-react";
import { format, isAfter } from "date-fns";
import { useLang } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

export default function UpcomingTasks({ activities }) {
  const { lang } = useLang();
  const tasks = activities
    .filter(a => a.type === "task" && a.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">{t("Upcoming Tasks", lang)}</h3>
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center py-8">
          <CheckSquare className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm text-slate-400">{t("No upcoming tasks", lang)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.slice(0, 6).map(task => {
            const isOverdue = !task.completed && isAfter(new Date(), new Date(task.due_date));
            return (
              <div key={task.id} className="flex items-start gap-3">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className={`w-5 h-5 shrink-0 mt-0.5 ${isOverdue ? "text-rose-400" : "text-slate-300"}`} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                    {task.subject}
                  </p>
                  <p className={`text-xs ${isOverdue ? "text-rose-500" : "text-slate-500"}`}>
                    {t("Due", lang)} {format(new Date(task.due_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}