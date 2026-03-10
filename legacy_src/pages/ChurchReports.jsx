import React, { useState, useMemo } from "react";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, HandHeart, TrendingUp, Calendar, Download, FileText,
  BarChart3, Church, BookOpen, Filter, Printer
} from "lucide-react";

const fmt = (v) => `$${Number(v).toLocaleString("en-CA", { minimumFractionDigits: 0 })}`;
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

// ── CSV export helper ──────────────────────────────────────────────────────
function exportCSV(rows, headers, filename) {
  const lines = [headers.join(","), ...rows.map(r => r.map(c => `"${c ?? ""}"`).join(","))];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Report type cards ──────────────────────────────────────────────────────
const REPORT_TYPES = [
  { id: "attendance", labels: { en: "Attendance", vi: "Điểm danh", fr: "Présence" }, icon: Calendar, color: "indigo", descs: { en: "Sunday attendance stats by week / month / year", vi: "Thống kê điểm danh Chúa Nhật theo tuần / tháng / năm", fr: "Stats de présence dominicale" } },
  { id: "members",    labels: { en: "Members",    vi: "Thành viên", fr: "Membres" }, icon: Users,    color: "emerald", descs: { en: "Member list and analysis", vi: "Danh sách và phân tích thành viên", fr: "Liste et analyse des membres" } },
  { id: "finance",    labels: { en: "Tithes",  vi: "Dâng hiến",  fr: "Dîmes" }, icon: HandHeart, color: "violet", descs: { en: "Tithe summary and year comparison", vi: "Tổng hợp dâng hiến và so sánh năm", fr: "Résumé des dîmes" } },
  { id: "events",     labels: { en: "Events",     vi: "Sự kiện",    fr: "Événements" }, icon: Church, color: "amber",  descs: { en: "Event history and statistics", vi: "Lịch sử và thống kê sự kiện", fr: "Historique des événements" } },
  { id: "training",   labels: { en: "Training",   vi: "Đào tạo",    fr: "Formation" }, icon: BookOpen, color: "rose",  descs: { en: "Training programs and completion rates", vi: "Chương trình đào tạo và tỷ lệ hoàn thành", fr: "Programmes de formation" } },
];

const colorMap = {
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  icon: "text-indigo-500",  ring: "ring-indigo-500",  btn: "bg-indigo-600 hover:bg-indigo-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500", ring: "ring-emerald-500", btn: "bg-emerald-600 hover:bg-emerald-700" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  icon: "text-violet-500",  ring: "ring-violet-500",  btn: "bg-violet-600 hover:bg-violet-700" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   icon: "text-amber-500",   ring: "ring-amber-500",   btn: "bg-amber-600 hover:bg-amber-700" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    icon: "text-rose-500",    ring: "ring-rose-500",    btn: "bg-rose-600 hover:bg-rose-700" },
};

// ── Sub-reports ────────────────────────────────────────────────────────────

function AttendanceReport({ records, lang }) {
  const years = useMemo(() => [...new Set(records.map(r => new Date(r.date).getFullYear()))].sort().reverse(), [records]);
  const [year, setYear] = useState(years[0] || 2025);

  const yearRecs = useMemo(() => records.filter(r => r.attendance && new Date(r.date).getFullYear() === year)
    .sort((a, b) => new Date(a.date) - new Date(b.date)), [records, year]);

  const monthlyData = useMemo(() => {
    const map = {};
    yearRecs.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString(lang === "vi" ? "vi-VN" : lang === "fr" ? "fr-FR" : "en-US", { month: "short" });
      if (!map[key]) map[key] = { label, att: 0, tithe: 0, count: 0 };
      map[key].att += r.attendance; map[key].tithe += r.tithe_cad || 0; map[key].count++;
    });
    return Object.values(map).map(m => ({ ...m, avg: Math.round(m.att / m.count) }));
  }, [yearRecs, lang]);

  const avg = yearRecs.length ? Math.round(yearRecs.reduce((s, r) => s + r.attendance, 0) / yearRecs.length) : 0;
  const total = yearRecs.reduce((s, r) => s + (r.tithe_cad || 0), 0);

  const yearlyComparison = useMemo(() => years.map(y => {
    const yr = records.filter(r => r.attendance && new Date(r.date).getFullYear() === y);
    return { year: String(y), avg: yr.length ? Math.round(yr.reduce((s, r) => s + r.attendance, 0) / yr.length) : 0 };
  }), [records, years]);

  const handleExport = () => {
    exportCSV(
      yearRecs.map(r => [r.date, r.attendance, r.tithe_cad || ""]),
      [t("Date", lang), t("Attendance", lang), t("Offering (CAD)", lang)],
      `attendance_${year}.csv`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <Button size="sm" variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> {lang === "vi" ? "Xuất CSV" : "Export CSV"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: t("Avg Attendance/week", lang), value: avg },
          { label: t("Total Tithes", lang), value: fmt(total) },
          { label: t("Weeks of data", lang), value: yearRecs.length },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">{t("Avg attendance by month", lang)} {year}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} />
                <Bar dataKey="avg" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">{t("Year-over-year attendance", lang)}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={yearlyComparison} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} />
                <Bar dataKey="avg" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">{t("Weekly detail", lang)}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-800 text-white">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold">{t("Date", lang)}</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold">{t("Attendance", lang)}</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold">{t("Offering (CAD)", lang)}</th>
                </tr>
              </thead>
              <tbody>
                {yearRecs.map(r => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-600">{new Date(r.date).toLocaleDateString(lang === "vi" ? "vi-VN" : lang === "fr" ? "fr-FR" : "en-US", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                    <td className="px-4 py-2 text-right font-medium text-indigo-700">{r.attendance}</td>
                    <td className="px-4 py-2 text-right text-emerald-700">{r.tithe_cad ? fmt(r.tithe_cad) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const MEMBERS_LABELS = {
  en: { status: "Status", all: "All", active: "Active", inactive: "Inactive", transferred: "Transferred", deceased: "Deceased", joinedFrom: "Joined from", toDate: "To date", exportCSV: "Export CSV", totalMembers: "Total Members", filtered: "Filtered", baptized: "Baptized", kids: "Children", statusDist: "Status distribution", profDist: "Top professions", listOf: "List", name: "Name", email: "Email", joined: "Joined", baptism: "Baptized" },
  vi: { status: "Trạng thái", all: "Tất cả", active: "Hoạt động", inactive: "Không hoạt động", transferred: "Chuyển đi", deceased: "Đã mất", joinedFrom: "Gia nhập từ", toDate: "Đến ngày", exportCSV: "Xuất CSV", totalMembers: "Tổng thành viên", filtered: "Kết quả lọc", baptized: "Đã báp-têm", kids: "Thiếu nhi", statusDist: "Phân bố trạng thái", profDist: "Nghề nghiệp phổ biến", listOf: "Danh sách", name: "Họ tên", email: "Email", joined: "Gia nhập", baptism: "Báp-têm" },
  fr: { status: "Statut", all: "Tous", active: "Actif", inactive: "Inactif", transferred: "Transféré", deceased: "Décédé", joinedFrom: "Rejoint depuis", toDate: "Jusqu'à", exportCSV: "Exporter CSV", totalMembers: "Total membres", filtered: "Résultat filtré", baptized: "Baptisés", kids: "Enfants", statusDist: "Répartition statut", profDist: "Professions principales", listOf: "Liste", name: "Nom", email: "Email", joined: "Rejoint", baptism: "Baptême" },
};

function MembersReport({ contacts, lang }) {
  const L = MEMBERS_LABELS[lang] || MEMBERS_LABELS.en;
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => contacts.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (fromDate && c.member_since && c.member_since < fromDate) return false;
    if (toDate && c.member_since && c.member_since > toDate) return false;
    return true;
  }), [contacts, statusFilter, fromDate, toDate]);

  const statusDist = useMemo(() => {
    const m = {};
    contacts.forEach(c => { const s = c.status || "active"; m[s] = (m[s] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [contacts]);

  const profDist = useMemo(() => {
    const m = {};
    contacts.forEach(c => { if (c.profession) m[c.profession] = (m[c.profession] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [contacts]);

  const baptized = contacts.filter(c => c.baptism).length;
  const kids = contacts.filter(c => c.is_kid).length;

  const handleExport = () => {
    exportCSV(
      filtered.map(c => [c.first_name, c.last_name, c.email, c.phone, c.status, c.member_since, c.baptism ? "Y" : "N"]),
      [L.name, "Last Name", L.email, "Phone", L.status, L.joined, L.baptism],
      "members.csv"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">{L.status}</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
            <option value="all">{L.all}</option>
            <option value="active">{L.active}</option>
            <option value="inactive">{L.inactive}</option>
            <option value="transferred">{L.transferred}</option>
            <option value="deceased">{L.deceased}</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">{L.joinedFrom}</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">{L.toDate}</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white" />
        </div>
        <Button size="sm" variant="outline" onClick={handleExport} className="gap-2 self-end">
          <Download className="w-4 h-4" /> {L.exportCSV}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: L.totalMembers, value: contacts.length },
          { label: L.filtered, value: filtered.length },
          { label: L.baptized, value: baptized },
          { label: L.kids, value: kids },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">{L.statusDist}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">{L.profDist}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={profDist} layout="vertical" barSize={12}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">{L.listOf} ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-800 text-white">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold">{L.name}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold">{L.email}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold">{L.status}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold">{L.joined}</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold">{L.baptism}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-700">{c.first_name} {c.last_name}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{c.email}</td>
                    <td className="px-4 py-2"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{c.status || "active"}</span></td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{c.member_since || "—"}</td>
                    <td className="px-4 py-2 text-center">{c.baptism ? "✅" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinanceReport({ records, lang }) {
  const years = useMemo(() => [...new Set(records.map(r => new Date(r.date).getFullYear()))].sort().reverse(), [records]);
  const [year, setYear] = useState(years[0] || 2025);

  const yearRecs = records.filter(r => r.tithe_cad && new Date(r.date).getFullYear() === year);
  const total = yearRecs.reduce((s, r) => s + (r.tithe_cad || 0), 0);
  const avg = yearRecs.length ? total / yearRecs.length : 0;

  const monthly = useMemo(() => {
    const map = {};
    yearRecs.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getMonth() + 1}`;
      const label = d.toLocaleDateString(lang === "vi" ? "vi-VN" : lang === "fr" ? "fr-FR" : "en-US", { month: "short" });
      if (!map[key]) map[key] = { label, tithe: 0 };
      map[key].tithe += r.tithe_cad || 0;
    });
    return Object.values(map);
  }, [yearRecs, lang]);

  const yearlyTotals = useMemo(() => years.map(y => {
    const yr = records.filter(r => r.tithe_cad && new Date(r.date).getFullYear() === y);
    return { year: String(y), total: yr.reduce((s, r) => s + (r.tithe_cad || 0), 0) };
  }), [records, years]);

  const handleExport = () => {
    exportCSV(
      yearRecs.sort((a, b) => new Date(a.date) - new Date(b.date)).map(r => [r.date, r.tithe_cad]),
      [t("Date", lang), t("Offering (CAD)", lang)],
      `offerings_${year}.csv`
    );
  };

  const offeringLabel = lang === "vi" ? "Dâng hiến" : lang === "fr" ? "Dîme" : "Tithe";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <Button size="sm" variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> {lang === "vi" ? "Xuất CSV" : "Export CSV"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: t("Total Tithes", lang), value: fmt(total) },
          { label: t("Avg Tithe/week", lang), value: fmt(avg) },
          { label: t("Weeks of data", lang), value: yearRecs.length },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-violet-700">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">{t("Tithes by month", lang)} {year}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [fmt(v), offeringLabel]} contentStyle={{ borderRadius: 8, border: "none" }} />
                <Bar dataKey="tithe" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">{t("Year-over-year total tithes", lang)}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={yearlyTotals} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [fmt(v), offeringLabel]} contentStyle={{ borderRadius: 8, border: "none" }} />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const EVENT_CATS = {
  en: { all: "All", evangelism: "Evangelism", spiritual_enhancement: "Spiritual", social_work: "Social Work", worship: "Worship", kids: "Kids", training: "Training", general: "General" },
  vi: { all: "Tất cả", evangelism: "Truyền giáo", spiritual_enhancement: "Thuộc linh", social_work: "Xã hội", worship: "Thờ phượng", kids: "Thiếu nhi", training: "Đào tạo", general: "Chung" },
  fr: { all: "Tous", evangelism: "Évangélisation", spiritual_enhancement: "Spirituel", social_work: "Social", worship: "Adoration", kids: "Enfants", training: "Formation", general: "Général" },
};

function EventsReport({ activities, lang }) {
  const EC = EVENT_CATS[lang] || EVENT_CATS.en;
  const [typeFilter, setTypeFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => activities.filter(a => {
    if (typeFilter !== "all" && a.event_category !== typeFilter) return false;
    if (fromDate && a.due_date && a.due_date < fromDate) return false;
    if (toDate && a.due_date && a.due_date > toDate) return false;
    return true;
  }), [activities, typeFilter, fromDate, toDate]);

  const catDist = useMemo(() => {
    const m = {};
    activities.forEach(a => { const k = a.event_category || a.type || "other"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [activities]);

  const doneLabel = lang === "vi" ? "Xong" : lang === "fr" ? "Fait" : "Done";
  const pendingLabel = lang === "vi" ? "Chưa" : lang === "fr" ? "Non" : "Pending";

  const handleExport = () => {
    exportCSV(
      filtered.map(a => [a.subject, a.type, a.event_category || "", a.due_date || "", a.location || "", a.responsible_person || "", a.completed ? doneLabel : pendingLabel]),
      ["Subject", "Type", "Category", "Date", "Location", "Responsible", "Status"],
      "events.csv"
    );
  };

  const totalLabel = lang === "vi" ? "Tổng sự kiện" : lang === "fr" ? "Total événements" : "Total Events";
  const filteredLabel = lang === "vi" ? "Kết quả lọc" : lang === "fr" ? "Résultat filtré" : "Filtered";
  const completedLabel = lang === "vi" ? "Đã hoàn thành" : lang === "fr" ? "Terminé" : "Completed";
  const catLabel = lang === "vi" ? "Danh mục" : lang === "fr" ? "Catégorie" : "Category";
  const dateLabel = lang === "vi" ? "Ngày" : lang === "fr" ? "Date" : "Date";
  const responsibleLabel = lang === "vi" ? "Phụ trách" : lang === "fr" ? "Responsable" : "Responsible";
  const statusLabel = lang === "vi" ? "Trạng thái" : lang === "fr" ? "Statut" : "Status";
  const distLabel = lang === "vi" ? "Phân bố theo danh mục" : lang === "fr" ? "Répartition par catégorie" : "Distribution by category";
  const listLabel = lang === "vi" ? "Danh sách" : lang === "fr" ? "Liste" : "List";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">{catLabel}</label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
            {Object.entries(EC).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">{lang === "vi" ? "Từ ngày" : lang === "fr" ? "Depuis" : "From"}</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">{lang === "vi" ? "Đến ngày" : lang === "fr" ? "Jusqu'à" : "To"}</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white" />
        </div>
        <Button size="sm" variant="outline" onClick={handleExport} className="gap-2 self-end">
          <Download className="w-4 h-4" /> {lang === "vi" ? "Xuất CSV" : "Export CSV"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: totalLabel, value: activities.length },
          { label: filteredLabel, value: filtered.length },
          { label: completedLabel, value: activities.filter(a => a.completed).length },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">{distLabel}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={catDist} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} />
              <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">{listLabel} ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-800 text-white">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold">{lang === "vi" ? "Tên sự kiện" : lang === "fr" ? "Événement" : "Event"}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold">{catLabel}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold">{dateLabel}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold">{responsibleLabel}</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold">{statusLabel}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-700">{a.subject}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{a.event_category || a.type}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{a.due_date || "—"}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{a.responsible_person || "—"}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {a.completed ? doneLabel : pendingLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrainingReport({ programs, contacts, lang }) {
  const statusLabel = (s) => {
    if (s === "completed") return lang === "vi" ? "Xong" : lang === "fr" ? "Terminé" : "Done";
    if (s === "ongoing") return lang === "vi" ? "Đang diễn ra" : lang === "fr" ? "En cours" : "Ongoing";
    return lang === "vi" ? "Sắp tới" : lang === "fr" ? "À venir" : "Upcoming";
  };

  const handleExport = () => {
    exportCSV(
      programs.map(p => [p.name, p.category, p.status, p.instructor || "", p.start_date || "", p.end_date || "", (p.enrolled_contact_ids || []).length, (p.completed_contact_ids || []).length]),
      ["Name", "Category", "Status", "Instructor", "Start", "End", "Enrolled", "Completed"],
      "training.csv"
    );
  };

  const catDist = useMemo(() => {
    const m = {};
    programs.forEach(p => { const k = p.category || "other"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [programs]);

  const totalEnrolled = programs.reduce((s, p) => s + (p.enrolled_contact_ids || []).length, 0);
  const totalCompleted = programs.reduce((s, p) => s + (p.completed_contact_ids || []).length, 0);
  const completionRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  const L = {
    totalProg: lang === "vi" ? "Tổng chương trình" : lang === "fr" ? "Total programmes" : "Total Programs",
    totalEnrolled: lang === "vi" ? "Tổng đăng ký" : lang === "fr" ? "Total inscrits" : "Total Enrolled",
    completed: lang === "vi" ? "Đã hoàn thành" : lang === "fr" ? "Terminés" : "Completed",
    rate: lang === "vi" ? "Tỷ lệ hoàn thành" : lang === "fr" ? "Taux d'achèvement" : "Completion Rate",
    catDist: lang === "vi" ? "Phân bố theo danh mục" : lang === "fr" ? "Par catégorie" : "By Category",
    list: lang === "vi" ? "Danh sách chương trình" : lang === "fr" ? "Liste des programmes" : "Program List",
    name: lang === "vi" ? "Tên" : lang === "fr" ? "Nom" : "Name",
    enrolled: lang === "vi" ? "Đăng ký" : lang === "fr" ? "Inscrits" : "Enrolled",
    done: lang === "vi" ? "Xong" : lang === "fr" ? "Terminés" : "Done",
    status: lang === "vi" ? "Trạng thái" : lang === "fr" ? "Statut" : "Status",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> {lang === "vi" ? "Xuất CSV" : "Export CSV"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: L.totalProg, value: programs.length },
          { label: L.totalEnrolled, value: totalEnrolled },
          { label: L.completed, value: totalCompleted },
          { label: L.rate, value: `${completionRate}%` },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-rose-700">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">{L.catDist}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={catDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {catDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">{L.list}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-800 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold">{L.name}</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">{L.enrolled}</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">{L.done}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">{L.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map(p => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-700 text-xs font-medium">{p.name}</td>
                      <td className="px-3 py-2 text-center text-indigo-700 text-xs">{(p.enrolled_contact_ids || []).length}</td>
                      <td className="px-3 py-2 text-center text-emerald-700 text-xs">{(p.completed_contact_ids || []).length}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "completed" ? "bg-emerald-100 text-emerald-700" : p.status === "ongoing" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {statusLabel(p.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ChurchReports() {
  const { lang } = useLang();
  const [activeReport, setActiveReport] = useState("attendance");

  const { data: records = [] } = useQuery({ queryKey: ["attendance"], queryFn: () => base44.entities.AttendanceRecord.list("-date", 500) });
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => base44.entities.Contact.list() });
  const { data: activities = [] } = useQuery({ queryKey: ["activities"], queryFn: () => base44.entities.Activity.list("-created_date", 500) });
  const { data: programs = [] } = useQuery({ queryKey: ["programs"], queryFn: () => base44.entities.TrainingProgram.list() });

  const active = REPORT_TYPES.find(r => r.id === activeReport);
  const c = colorMap[active?.color || "indigo"];

  const pageTitle = lang === "vi" ? "Báo cáo Hội Thánh" : lang === "fr" ? "Rapports d'Église" : "Church Reports";
  const pageSubtitle = lang === "vi" ? "Chọn loại báo cáo, điều chỉnh tham số và xuất dữ liệu" : lang === "fr" ? "Sélectionnez un type de rapport, ajustez les paramètres et exportez" : "Select a report type, adjust parameters and export data";

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{pageTitle}</h2>
        <p className="text-sm text-slate-500">{pageSubtitle}</p>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {REPORT_TYPES.map(rt => {
          const cc = colorMap[rt.color];
          const isActive = activeReport === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setActiveReport(rt.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${isActive ? `border-current ring-2 ${cc.ring} ${cc.bg} ${cc.text}` : "border-slate-100 bg-white hover:border-slate-200 text-slate-600"}`}
            >
              <rt.icon className={`w-5 h-5 mb-2 ${isActive ? cc.icon : "text-slate-400"}`} />
              <p className="text-sm font-semibold">{rt.labels[lang] || rt.labels.en}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-tight line-clamp-2">{rt.descs[lang] || rt.descs.en}</p>
            </button>
          );
        })}
      </div>

      {/* Active report content */}
      <div>
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> {lang === "vi" ? "In báo cáo" : lang === "fr" ? "Imprimer" : "Print Report"}
          </Button>
        </div>
        {activeReport === "attendance" && <AttendanceReport records={records} lang={lang} />}
        {activeReport === "members"    && <MembersReport contacts={contacts} lang={lang} />}
        {activeReport === "finance"    && <FinanceReport records={records} lang={lang} />}
        {activeReport === "events"     && <EventsReport activities={activities} lang={lang} />}
        {activeReport === "training"   && <TrainingReport programs={programs} contacts={contacts} lang={lang} />}
      </div>
    </div>
  );
}