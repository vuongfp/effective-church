import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, TrendingDown, HandHeart, ChevronDown, ChevronRight } from "lucide-react";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AttendanceChart from "@/components/church/AttendanceChart";
import AttendanceTitheWidget from "@/components/church/AttendanceTitheWidget";

// ── INCOME DATA ──────────────────────────────────────────────────────────────
const INCOME_ITEMS = [
  { vi: "Vô Danh", en: "Anonymous", amount: 11250.00 },
  { vi: "Có Tên", en: "Donor Recorded", amount: 168480.50 },
  { vi: "Mục Vụ Anh Ngữ", en: "English Ministry", amount: 4320.00 },
  { vi: "Cứu Trợ", en: "Flood Relief", amount: 2750.00 },
  { vi: "Linh Tinh", en: "Miscellaneous", amount: 1890.00 },
];

// ── BUDGET SECTIONS ───────────────────────────────────────────────────────────
const BUDGET_SECTIONS = [
  {
    vi: "Hành Chánh",
    en: "Administration",
    items: [
      { vi: "Mướn Nhà Thờ", en: "Church Rental", planned: 32000.00, actual: 32000.00 },
      { vi: "Bảo Hiểm", en: "Insurance", planned: 2400.00, actual: 2318.75 },
      { vi: "Điện Thoại/Internet", en: "Telephone/Internet", planned: 1800.00, actual: 1654.20 },
      { vi: "Vật liệu văn phòng/nhà bếp", en: "Office/Kitchen Supplies", planned: 1600.00, actual: 1245.60 },
      { vi: "Lương bổng/Hưu Bổng Mục Sư", en: "Salary/Pension", planned: 108000.00, actual: 109420.00 },
      { vi: "Chi Phí Ngân Hàng", en: "Bank Charges", planned: 350.00, actual: 312.45 },
    ],
    plannedTotal: 146150.00,
    actualTotal: 146951.00,
  },
  {
    vi: "Mục Vụ",
    en: "Ministries",
    items: [
      { vi: "Ca Đoàn / Thờ Phượng", en: "Choir / Worship", planned: 2500.00, actual: 2680.00 },
      { vi: "NGPN", en: "Men-Women Ministry", planned: 2000.00, actual: 850.00 },
      { vi: "Nhóm/Thăm Viếng/Chứng Đạo", en: "Cell Group / Visit / Evangelism", planned: 2000.00, actual: 430.00 },
      { vi: "Mục Vụ / Diễn Giả Anh Ngữ", en: "English Ministry / Guest Speaker", planned: 12000.00, actual: 9250.00 },
      { vi: "Ban Trường Chúa Nhật/Văn Phẫm", en: "Christian Ed / Literatures", planned: 1800.00, actual: 1540.00 },
      { vi: "Huấn Luyện Bồi Linh", en: "Training", planned: 2500.00, actual: 2890.00 },
      { vi: "Những Lễ Lớn/Trại Hè/Picnic", en: "Seasonal Events/Retreat/Picnic", planned: 2000.00, actual: 1720.00 },
      { vi: "Diễn Giả", en: "Guest Speakers", planned: 2000.00, actual: 1200.00 },
      { vi: "Truyền Giáo / Dự Án Từ Thiện", en: "Mission / Outreach Projects", planned: 6000.00, actual: 4850.00 },
    ],
    plannedTotal: 32800.00,
    actualTotal: 25410.00,
  },
  {
    vi: "Đặc Biệt",
    en: "Special",
    items: [
      { vi: "Truyền Giáo C&MA", en: "C&MA Global Advance", planned: 6000.00, actual: 6000.00 },
      { vi: "Địa Hạt C&MA Miền Đông", en: "C&MA Eastern District", planned: 2500.00, actual: 2500.00 },
      { vi: "Giáo Hạt Việt Nam", en: "AVAC", planned: 1800.00, actual: 1800.00 },
      { vi: "Quà Bất Thường / Linh Tinh", en: "Occasional Gift / Miscellaneous", planned: 2000.00, actual: 3280.50 },
    ],
    plannedTotal: 12300.00,
    actualTotal: 13580.50,
  },
];

const GRAND = {
  totalIncome: 188690.50,
  totalExpense: 185941.50,
  yearEndDiff: 2749.00,
  balanceStart: 98450.00,
  balanceEnd: 101199.00,
  investmentFund: 215600.00,
  weeklyOffering: 3628.66,
};

const fmt = (v) => {
  if (v === 0) return "—";
  const abs = Math.abs(v);
  const formatted = `$${abs.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return v < 0 ? `(${formatted})` : formatted;
};
const fmtDiff = (v) => {
  if (v === 0) return "—";
  const abs = Math.abs(v);
  const formatted = `$${abs.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return v < 0 ? `-${formatted}` : formatted;
};
const diff = (planned, actual) => actual === 0 ? null : actual - planned;

function DiffCell({ value }) {
  if (value === null) return <td className="px-3 py-2 text-right text-slate-300 text-xs">—</td>;
  const isPositive = value > 0;
  return (
    <td className={`px-3 py-2 text-right text-xs font-semibold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
      {fmtDiff(value)}
    </td>
  );
}

function BudgetSection({ section, lang }) {
  const [open, setOpen] = useState(true);
  const sectionDiff = section.actualTotal - section.plannedTotal;

  return (
    <tbody>
      {/* Section header */}
      <tr
        className="bg-violet-50 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <td className="px-3 py-2.5 font-bold text-violet-800 text-sm flex items-center gap-1">
          {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          {lang === "vi" ? section.vi : section.en}
        </td>
        <td className="px-3 py-2.5 text-right font-bold text-slate-700 text-sm">{fmt(section.plannedTotal)}</td>
        <td className="px-3 py-2.5 text-right font-bold text-slate-700 text-sm">{fmt(section.actualTotal)}</td>
        <td className={`px-3 py-2.5 text-right font-bold text-sm ${sectionDiff > 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {fmtDiff(sectionDiff)}
        </td>
      </tr>
      {open && section.items.map((item, i) => {
        const d = diff(item.planned, item.actual);
        return (
          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/70">
            <td className="px-3 py-2 text-sm text-slate-600 pl-8">{lang === "vi" ? item.vi : item.en}</td>
            <td className="px-3 py-2 text-right text-sm text-slate-500">{fmt(item.planned)}</td>
            <td className="px-3 py-2 text-right text-sm text-slate-700">{item.actual === 0 ? "—" : fmt(item.actual)}</td>
            <DiffCell value={d} />
          </tr>
        );
      })}
    </tbody>
  );
}

const FINANCE_LABELS = {
  en: {
    pageTitle: "Church Finances 2025",
    pageSubtitle: "Vietnamese Alliance Church — Fiscal Year 2025",
    totalIncome: "Total Income 2025",
    avgWeekly: "Avg offering/week",
    totalExpense: "Total Expenses 2025",
    yearEndDiff: "Year-end balance",
    balanceStart: "Opening balance",
    balanceEnd: "Closing Fund",
    investment: "Investment",
    incomeBreakdown: "Income Breakdown 2025",
    incomeTotal: "Total Income",
    budgetChart: "Budget vs Actual by Category",
    budgetPlanned: "Budget",
    budgetActual: "Actual",
    budgetTable: "Budget Detail 2025",
    budgetNote: "Diff: green = savings, red = over budget",
    category: "Category",
    planned: "Budget",
    actual: "Actual",
    diff: "Difference",
    grandTotal: "Total",
  },
  vi: {
    pageTitle: "Tài Chính Hội Thánh 2025",
    pageSubtitle: "Hội Thánh Tin Lành Việt Nam — Năm tài chính 2025",
    totalIncome: "Tổng Thu 2025",
    avgWeekly: "Dâng hiến TB/tuần",
    totalExpense: "Tổng Chi 2025",
    yearEndDiff: "Chênh lệch cuối năm",
    balanceStart: "Tồn đầu năm",
    balanceEnd: "Tồn Quỹ (cuối năm)",
    investment: "Đầu tư",
    incomeBreakdown: "Phân loại Thu nhập 2025",
    incomeTotal: "Tổng Cộng Thu",
    budgetChart: "Dự Chi vs Thực Chi theo Hạng mục",
    budgetPlanned: "Dự Chi",
    budgetActual: "Thực Chi",
    budgetTable: "Chi Tiết Ngân Sách 2025",
    budgetNote: "Chênh lệch: xanh = tiết kiệm, đỏ = vượt ngân sách",
    category: "Hạng mục",
    planned: "Dự Chi",
    actual: "Thực Chi",
    diff: "Chênh lệch",
    grandTotal: "Tổng Cộng",
  },
  fr: {
    pageTitle: "Finances de l'Église 2025",
    pageSubtitle: "Église Alliance Vietnamienne — Exercice 2025",
    totalIncome: "Total Revenus 2025",
    avgWeekly: "Offrande moy./semaine",
    totalExpense: "Total Dépenses 2025",
    yearEndDiff: "Solde fin d'année",
    balanceStart: "Solde ouverture",
    balanceEnd: "Fonds (fin d'année)",
    investment: "Investissement",
    incomeBreakdown: "Répartition Revenus 2025",
    incomeTotal: "Total Revenus",
    budgetChart: "Budget vs Réel par catégorie",
    budgetPlanned: "Budget",
    budgetActual: "Réel",
    budgetTable: "Détail Budget 2025",
    budgetNote: "Différence : vert = économies, rouge = dépassement",
    category: "Catégorie",
    planned: "Budget",
    actual: "Réel",
    diff: "Différence",
    grandTotal: "Total",
  },
};

export default function ChurchFinances() {
  const { lang } = useLang();
  const L = FINANCE_LABELS[lang] || FINANCE_LABELS.en;
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => base44.entities.AttendanceRecord.list("-date", 500),
  });

  const chartData = useMemo(() => BUDGET_SECTIONS.map(s => ({
    name: lang === "vi" ? s.vi : s.en,
    planned: s.plannedTotal,
    actual: s.actualTotal,
  })), [lang]);

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{L.pageTitle}</h2>
        <p className="text-sm text-slate-500">{L.pageSubtitle}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{L.totalIncome}</p>
                <p className="text-2xl font-bold text-emerald-600">{fmt(GRAND.totalIncome)}</p>
                <p className="text-xs text-slate-400 mt-1">{L.avgWeekly}: {fmt(GRAND.weeklyOffering)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{L.totalExpense}</p>
                <p className="text-2xl font-bold text-rose-600">{fmt(GRAND.totalExpense)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{L.yearEndDiff}</p>
                <p className={`text-2xl font-bold ${GRAND.yearEndDiff < 0 ? "text-rose-600" : "text-slate-700"}`}>{fmt(GRAND.yearEndDiff)}</p>
                <p className="text-xs text-slate-400 mt-1">{L.balanceStart}: {fmt(GRAND.balanceStart)}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${GRAND.yearEndDiff < 0 ? "bg-rose-50" : "bg-blue-50"} flex items-center justify-center`}>
                <DollarSign className={`w-5 h-5 ${GRAND.yearEndDiff < 0 ? "text-rose-600" : "text-blue-600"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{L.balanceEnd}</p>
                <p className={`text-xl font-bold ${GRAND.balanceEnd < 0 ? "text-rose-600" : "text-slate-700"}`}>{fmt(GRAND.balanceEnd)}</p>
                <p className="text-xs text-slate-400 mt-1">{L.investment}: {fmt(GRAND.investmentFund)}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${GRAND.balanceEnd < 0 ? "bg-rose-50" : "bg-amber-50"} flex items-center justify-center`}>
                <HandHeart className={`w-5 h-5 ${GRAND.balanceEnd < 0 ? "text-rose-600" : "text-amber-600"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income breakdown */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">{L.incomeBreakdown}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {INCOME_ITEMS.map((item, i) => {
              const pct = (item.amount / GRAND.totalIncome) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{lang === "vi" ? item.vi : item.en}</span>
                    <span className="font-semibold text-slate-800">{fmt(item.amount)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-100">
              <span>{L.incomeTotal}</span>
              <span className="text-emerald-600">{fmt(GRAND.totalIncome)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance & Tithe for 2026 */}
      {attendanceRecords.length > 0 && (
        <AttendanceTitheWidget records={attendanceRecords} lang={lang} />
      )}

      {/* 2025 Financial Report - Historical Section */}
      <div className="border-t border-slate-200 pt-8 mt-8">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">{lang === "vi" ? "Báo cáo Tài Chính Năm 2025" : "2025 Financial Report"}</h3>
          <p className="text-sm text-slate-500">{lang === "vi" ? "Dữ liệu lịch sử năm ngoái" : "Historical data from last year"}</p>
        </div>

        {/* Budget chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">{L.budgetChart}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={18} barGap={4}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis hide />
              <Tooltip
                formatter={(v, name) => [`${fmt(v)}`, name === "planned" ? L.budgetPlanned : L.budgetActual]}
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="planned" fill="#a5b4fc" radius={[4, 4, 0, 0]} name="planned" />
              <Bar dataKey="actual" radius={[4, 4, 0, 0]} name="actual">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.actual > entry.planned ? "#f87171" : "#34d399"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-200 inline-block" /> {L.budgetPlanned}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> {L.budgetActual} ✓</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-400 inline-block" /> {L.budgetActual} ↑</span>
          </div>
        </CardContent>
      </Card>

      {/* Budget table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">{L.budgetTable}</CardTitle>
          <p className="text-xs text-slate-400">{L.budgetNote}</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold">{L.category}</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold">{L.planned}</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold">{L.actual}</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold">{L.diff}</th>
                </tr>
              </thead>
              {BUDGET_SECTIONS.map((section, i) => (
                <BudgetSection key={i} section={section} lang={lang} />
              ))}
              <tfoot>
                <tr className="bg-slate-900 text-white">
                  <td className="px-3 py-3 font-bold text-sm">{L.grandTotal}</td>
                  <td className="px-3 py-3 text-right font-bold text-sm">{fmt(191250.00)}</td>
                  <td className="px-3 py-3 text-right font-bold text-sm">{fmt(185941.50)}</td>
                  <td className={`px-3 py-3 text-right font-bold text-sm ${185941.50 - 191250.00 < 0 ? "text-rose-400" : "text-emerald-400"}`}>{fmtDiff(185941.50 - 191250.00)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}