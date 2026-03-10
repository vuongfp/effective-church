import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (v) => {
  if (v === 0) return "—";
  return `$${v.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function parseDate(dateStr) {
  if (!dateStr) return null;
  // Handle "Sunday, 07-01-2024" format
  const match = String(dateStr).match(/(\d{2})-(\d{2})-(\d{4})$/);
  if (match) {
    return new Date(`${match[3]}-${match[2]}-${match[1]}`);
  }
  return new Date(dateStr);
}

function getYear(dateStr) {
  try {
    const d = parseDate(dateStr);
    return d ? d.getFullYear() : null;
  } catch {
    return null;
  }
}

function getWeekNumber(dateStr) {
  try {
    const date = parseDate(dateStr);
    if (!date) return null;
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  } catch {
    return null;
  }
}

export default function AttendanceTitheWidget({ records, lang }) {
  // Filter 2026 data only (current year)
  const currentYearRecords = records.filter((r) => getYear(r.date) === 2026);

  // Group by week
  const chartData = currentYearRecords
    .map((r) => {
      const d = parseDate(r.date);
      if (!d) return null;
      const label = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
      return { date: label, attendance: r.attendance || 0, tithe: r.tithe_cad || r.tithe_offering || 0, _ts: d.getTime() };
    })
    .filter(Boolean)
    .sort((a, b) => a._ts - b._ts);

  // Calculate totals
  const totalAttendance = chartData.reduce((sum, w) => sum + w.attendance, 0);
  const totalTithe = chartData.reduce((sum, w) => sum + w.tithe, 0);


  const labels = {
    en: {
      title: "2026 Weekly Attendance & Tithe",
      subtitle: "From January 1 to present",
      attendance: "Attendance",
      tithe: "Tithe Offering",
      weeks: "Weeks of Data",
      avgPerWeek: "Avg per week",
      week: "Week"
    },
    vi: {
      title: "Dâng Hiến & Thờ Phượng Hàng Tuần 2026",
      subtitle: "Từ 1 Tháng 1 đến nay",
      attendance: "Thờ Phượng",
      tithe: "Dâng Hiến",
      weeks: "Số Tuần Có Dữ Liệu",
      avgPerWeek: "TB/tuần",
      week: "Tuần"
    }
  };

  const L = labels[lang] || labels.en;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700">{L.title}</CardTitle>
        <p className="text-xs text-slate-400">{L.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          




          




        </div>

        {/* Weekly chart */}
        {chartData.length > 0 &&
        <div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barSize={16} barGap={8}>
                <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={50} />

                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                formatter={(value, name) => {
                  if (name === "attendance") return [value, L.attendance];
                  return [fmt(value), L.tithe];
                }}
                labelFormatter={(label) => label} />

                <Bar yAxisId="left" dataKey="attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="attendance" />
                <Bar yAxisId="right" dataKey="tithe" fill="#10b981" radius={[4, 4, 0, 0]} name="tithe" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-6 justify-center text-xs text-slate-500 mt-3">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500" /> {L.attendance}</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500" /> {L.tithe}</span>
            </div>
          </div>
        }

        {chartData.length > 0 &&
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
            {L.weeks}: {chartData.length}
          </div>
        }

      </CardContent>
    </Card>);

}