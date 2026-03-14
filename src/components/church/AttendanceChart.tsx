import React, { useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HandHeart } from "lucide-react";
import { useLang } from "@/components/i18n/LanguageContext";

const fmt = (v: any) => `$${Number(v).toLocaleString("en-CA", { minimumFractionDigits: 0 })}`;

// Group records by week or month
function groupByPeriod(records: any[], year: number, lang: string = "en", groupByWeek = false) {
  const locale = lang === "vi" ? "vi-VN" : "en-US";
  const map: Record<string, any> = {};
  records.forEach(r => {
    if (!r.date || !r.attendance) return;
    const d = new Date(r.date);
    if (year && d.getFullYear() !== year) return;

    let key, label;
    if (groupByWeek) {
      // Group by week: YYYY-W##
      const jan4 = new Date(d.getFullYear(), 0, 4);
      const dayDiff = (d.getTime() - jan4.getTime()) / (24 * 60 * 60 * 1000);
      const weekNum = Math.floor((dayDiff + jan4.getDay()) / 7) + 1;
      key = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
      label = `${d.toLocaleDateString(locale as string, { month: "short" })} ${d.getDate()}`;
    } else {
      // Group by month
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      label = d.toLocaleDateString(locale as string, { month: "short", year: "numeric" });
    }

    if (!map[key]) map[key] = { key, label, attendance: 0, tithe: 0, count: 0 };
    map[key].attendance += r.attendance;
    map[key].tithe += r.tithe_cad || 0;
    map[key].count += 1;
  });
  return Object.values(map).sort((a: any, b: any) => a.key.localeCompare(b.key)).map((m: any) => ({
    ...m,
    avgAttendance: Math.round(m.attendance / m.count),
  }));
}

export default function AttendanceChart({ records = [], year, compact = false, groupByWeek = true }: { records: any[], year: number, compact?: boolean, groupByWeek?: boolean }) {
  const { lang } = useLang();
  const monthlyData = useMemo(() => groupByPeriod(records, year, lang, groupByWeek), [records, year, lang, groupByWeek]);

  const totalAttendance = records.filter(r => r.attendance && (!year || new Date(r.date).getFullYear() === year)).reduce((s, r) => s + r.attendance, 0);
  const totalTithe = records.filter(r => r.tithe_cad && (!year || new Date(r.date).getFullYear() === year)).reduce((s, r) => s + r.tithe_cad, 0);
  const avgAttendance = records.filter(r => r.attendance && (!year || new Date(r.date).getFullYear() === year)).length > 0
    ? Math.round(totalAttendance / records.filter(r => r.attendance && (!year || new Date(r.date).getFullYear() === year)).length)
    : 0;

  const L = {
    compactTitle: lang === "vi" ? "Điểm danh" : "Attendance",
    avgWeek: lang === "vi" ? "TB" : "Avg",
    week: lang === "vi" ? "/tuần" : "/wk",
    avgAttLabel: lang === "vi" ? "TB Điểm danh/tuần" : "Avg Attendance/wk",
    totalOffering: lang === "vi" ? "Tổng dâng hiến" : "Total Tithes",
    avgOffering: lang === "vi" ? "TB dâng hiến/tuần" : "Avg Tithe/wk",
    attByMonth: lang === "vi" ? "Điểm danh TB theo tháng" : "Avg Attendance by Month",
    offeringByMonth: lang === "vi" ? "Dâng hiến theo tháng" : "Tithes by Month",
    tooltipAtt: lang === "vi" ? "TB điểm danh" : "Avg attendance",
    tooltipOffering: lang === "vi" ? "Dâng hiến" : "Tithe",
  };

  if (compact) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            {L.compactTitle} {year || ""} — {L.avgWeek}: {avgAttendance}{L.week}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v, n) => [n === "avgAttendance" ? `${v}` : fmt(v), n === "avgAttendance" ? L.tooltipAtt : L.tooltipOffering]}
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }}
              />
              <Bar dataKey="avgAttendance" fill="#6366f1" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 11, fill: '#64748b' }} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  const titheWeekCount = records.filter(r => r.tithe_cad && (!year || new Date(r.date).getFullYear() === year)).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{L.avgAttLabel} {year}</p>
                <p className="text-2xl font-bold text-indigo-700">{avgAttendance}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{L.totalOffering} {year}</p>
                <p className="text-2xl font-bold text-emerald-700">{fmt(totalTithe)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <HandHeart className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{L.avgOffering} {year}</p>
                <p className="text-2xl font-bold text-violet-700">
                  {fmt(titheWeekCount > 0 ? totalTithe / titheWeekCount : 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <HandHeart className="w-5 h-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">{L.attByMonth} {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${v}`, L.tooltipAtt]}
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="avgAttendance" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tithe chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">{L.offeringByMonth} {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="titheGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => [fmt(v), L.tooltipOffering]}
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Area type="monotone" dataKey="tithe" stroke="#10b981" fill="url(#titheGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}