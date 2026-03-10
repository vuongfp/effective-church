import React from "react";
import { Phone, Mail, Calendar, FileText, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { useLang } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

const typeIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: CheckSquare,
};

const typeColors = {
  call: "bg-emerald-50 text-emerald-600",
  email: "bg-blue-50 text-blue-600",
  meeting: "bg-violet-50 text-violet-600",
  note: "bg-amber-50 text-amber-600",
  task: "bg-rose-50 text-rose-600",
};

export default function RecentActivities({ activities }) {
  const { lang } = useLang();
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">{t("Recent Activities", lang)}</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">{t("No activities yet", lang)}</p>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 6).map(activity => {
            const Icon = typeIcons[activity.type] || FileText;
            const colorClass = typeColors[activity.type] || "bg-slate-50 text-slate-600";
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{activity.subject}</p>
                  <p className="text-xs text-slate-500">
                    {activity.contact_name && <span>{activity.contact_name} · </span>}
                    {format(new Date(activity.created_date), "MMM d, h:mm a")}
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