import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Heart, BookOpen, Calendar, Music, HandHeart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import ChurchCalendarWidget from "@/components/church/ChurchCalendarWidget";
import AttendanceChart from "@/components/church/AttendanceChart";
import DashboardMemberStats from "@/components/church/DashboardMemberStats";
import DashboardTasksWidget from "@/components/church/DashboardTasksWidget";
import DashboardOfferingChart from "@/components/church/DashboardOfferingChart";
import BirthdayNotifications from "@/components/church/BirthdayNotifications";

const EXPENSE_DATA = [
  { name: "Administration", value: 79, color: "#6366f1" },
  { name: "Ministries", value: 14, color: "#8b5cf6" },
  { name: "Special", value: 7, color: "#a78bfa" },
];

function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    sky: "bg-sky-50 text-sky-600",
  };
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {sub && <p className="text-xs text-emerald-600 mt-1">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color] || colors.indigo}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const MONTH_LABELS = {
  en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  vi: ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"],
  fr: ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"],
};

function VisitorChart({ visitors, lang }) {
  const months = MONTH_LABELS[lang] || MONTH_LABELS.en;
  const monthlyData = months.map((label, i) => {
    const count = visitors.filter(v => {
      const d = new Date(v.first_visit_date);
      return d.getFullYear() === 2026 && d.getMonth() === i;
    }).length;
    const returning = visitors.filter(v => {
      const d = new Date(v.last_visit_date || v.first_visit_date);
      return d.getFullYear() === 2026 && d.getMonth() === i && v.status === "returning";
    }).length;
    return { label, new: count, returning };
  });

  const totalNew = visitors.filter(v => new Date(v.first_visit_date).getFullYear() === 2026).length;
  const totalConverted = visitors.filter(v => v.status === "converted_member" && new Date(v.first_visit_date).getFullYear() === 2026).length;

  const newLabel = lang === "vi" ? "Khách mới" : lang === "fr" ? "Nouveaux" : "New Visitors";
  const returningLabel = lang === "vi" ? "Trở lại" : lang === "fr" ? "Retours" : "Returning";
  const title = lang === "vi" ? "Khách thăm 2026" : lang === "fr" ? "Visiteurs 2026" : "Visitors 2026";
  const totalLabel = lang === "vi" ? "Tổng khách" : lang === "fr" ? "Total visiteurs" : "Total Visitors";
  const convertedLabel = lang === "vi" ? "Đã gia nhập" : lang === "fr" ? "Convertis" : "Converted";

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-500" /> {title}
          </CardTitle>
          <div className="flex gap-4 text-xs text-slate-500">
            <span className="font-semibold text-sky-700">{totalLabel}: {totalNew}</span>
            <span className="font-semibold text-emerald-700">{convertedLabel}: {totalConverted}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} barSize={14} barGap={4}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }} />
            <Bar dataKey="new" name={newLabel} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="returning" name={returningLabel} fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-6 justify-center text-xs text-slate-500 mt-2">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-400 inline-block" /> {newLabel}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> {returningLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChurchDashboard() {
  const { lang } = useLang();
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => base44.entities.Contact.list() });
  const { data: groups = [] } = useQuery({ queryKey: ["groups"], queryFn: () => base44.entities.Group.list() });
  const { data: activities = [] } = useQuery({ queryKey: ["activities"], queryFn: () => base44.entities.Activity.list("-created_date", 20) });
  const { data: attendanceRecords = [] } = useQuery({ queryKey: ["attendance"], queryFn: () => base44.entities.AttendanceRecord.list("-date", 500) });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => base44.entities.Task.list() });
  const { data: visitors = [] } = useQuery({ queryKey: ["visitors"], queryFn: () => base44.entities.Visitor.list("-first_visit_date", 500) });

  const currentYear = new Date().getFullYear();
  const thisYearRecords = attendanceRecords.filter(r => r.attendance && new Date(r.date).getFullYear() === currentYear);
  const avgAttendance = thisYearRecords.length > 0 ? Math.round(thisYearRecords.reduce((s, r) => s + r.attendance, 0) / thisYearRecords.length) : 0;
  const totalTitheThisYear = thisYearRecords.reduce((s, r) => s + (r.tithe_cad || 0), 0);



  const upcomingEvents = activities.filter(a => a.type === "meeting" && !a.completed);

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Birthday & Care Notifications */}
      <BirthdayNotifications />

      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{t("Chào mừng đến ChurchCRM", lang)}</h2>
          <p className="text-sm text-white/80">{t("Quản lý hội thánh của bạn một cách hiệu quả và ân hậu.", lang)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label={t("Tổng thành viên", lang)} value={contacts.length} icon={Users} color="indigo" />

        <StatCard label={t("Nhóm / Tế bào (stat)", lang)} value={groups.length} icon={Users} color="violet" />
        <StatCard label={t("Sự kiện sắp tới", lang)} value={upcomingEvents.length} icon={Calendar} color="emerald" />
        <StatCard label={t("Avg Attendance/wk", lang)} value={avgAttendance || "—"} icon={Music} color="amber" sub={`${t("Year", lang)} ${currentYear}`} />
        <StatCard label={t("Tithe", lang)} value={totalTitheThisYear > 0 ? `$${(totalTitheThisYear/1000).toFixed(1)}k` : "—"} icon={HandHeart} color="sky" sub={`${t("Year", lang)} ${currentYear}`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AttendanceChart records={attendanceRecords} year={currentYear} compact />
        <DashboardOfferingChart records={attendanceRecords} year={currentYear} />
        <VisitorChart visitors={visitors} lang={lang} />
      </div>

      {/* Calendar widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChurchCalendarWidget events={activities} />

        {/* Upcoming events */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" /> {t("Sự kiện sắp tới", lang)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">{t("Chưa có sự kiện nào", lang)}</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 6).map(e => (
                  <div key={e.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{e.subject}</p>
                      {e.due_date && <p className="text-xs text-slate-400">{new Date(e.due_date).toLocaleDateString(lang === "vi" ? "vi-VN" : lang === "fr" ? "fr-FR" : "en-US")}</p>}
                    </div>
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.subject || "")}&details=${encodeURIComponent(e.description || "")}${e.due_date ? `&dates=${new Date(e.due_date).toISOString().replace(/-|:|\.\d{3}/g, "").slice(0,8)}/${new Date(e.due_date).toISOString().replace(/-|:|\.\d{3}/g, "").slice(0,8)}` : ""}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-xs text-indigo-500 hover:text-indigo-700 font-medium shrink-0"
                       title={t("Add to Google Calendar", lang)}
                      >
                      + GCal
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority Tasks */}
      <DashboardTasksWidget tasks={tasks} />


    </div>
  );
}