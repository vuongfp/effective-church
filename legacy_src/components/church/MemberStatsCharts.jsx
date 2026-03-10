import React from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useLang } from "@/components/i18n/LanguageContext";

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ef4444", "#84cc16"];

function getAge(birthday) {
  if (!birthday) return null;
  const diff = Date.now() - new Date(birthday).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function MemberStatsCharts({ contacts, groups }) {
  const { lang } = useLang();

  // Age distribution
  const ageBuckets = [
    { label: "0–12", min: 0, max: 12 },
    { label: "13–17", min: 13, max: 17 },
    { label: "18–23", min: 18, max: 23 },
    { label: "24–30", min: 24, max: 30 },
    { label: "31–45", min: 31, max: 45 },
    { label: "46–60", min: 46, max: 60 },
    { label: "61–70", min: 61, max: 70 },
    { label: "70+", min: 71, max: 200 },
  ];
  const ageData = ageBuckets.map(b => ({
    label: b.label,
    count: contacts.filter(c => { const a = getAge(c.birthday); return a !== null && a >= b.min && a <= b.max; }).length,
  }));

  // Gender
  const genderData = [
    { name: lang === "vi" ? "Nam" : "Male", value: contacts.filter(c => c.sex === "M").length },
    { name: lang === "vi" ? "Nữ" : "Female", value: contacts.filter(c => c.sex === "F").length },
    { name: lang === "vi" ? "Chưa rõ" : "N/A", value: contacts.filter(c => !c.sex).length },
  ].filter(d => d.value > 0);

  // Marital status
  const maritalData = [
    { name: lang === "vi" ? "Độc thân" : "Single", value: contacts.filter(c => c.marital_status === "Single").length },
    { name: lang === "vi" ? "Đã kết hôn" : "Married", value: contacts.filter(c => c.marital_status === "Married").length },
    { name: lang === "vi" ? "Góa" : "Widowed", value: contacts.filter(c => c.marital_status === "Widowed").length },
    { name: lang === "vi" ? "Ly hôn" : "Divorced", value: contacts.filter(c => c.marital_status === "Divorced").length },
  ].filter(d => d.value > 0);

  // Members not in any group
  const allMemberIdsInGroups = new Set(groups.flatMap(g => g.member_ids || []));
  const notInGroup = contacts.filter(c => !allMemberIdsInGroups.has(c.id)).length;

  const labels = {
    age: lang === "vi" ? "Phân bố độ tuổi" : lang === "fr" ? "Répartition par âge" : "Age Distribution",
    gender: lang === "vi" ? "Giới tính" : lang === "fr" ? "Genre" : "Gender",
    marital: lang === "vi" ? "Hôn nhân" : lang === "fr" ? "État civil" : "Marital Status",
    noGroup: lang === "vi" ? "Chưa có nhóm" : lang === "fr" ? "Sans groupe" : "Not in any group",
    totalGroups: lang === "vi" ? "Tổng số nhóm" : lang === "fr" ? "Total groupes" : "Total Groups",
    count: lang === "vi" ? "Số lượng" : lang === "fr" ? "Nombre" : "Count",
  };

  return (
    <div className="space-y-6">
      {/* Group stats - all in one row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">{lang === "vi" ? "Tổng thành viên" : "Total Members"}</p>
            <p className="text-2xl font-bold text-violet-700">{contacts.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">{labels.totalGroups}</p>
            <p className="text-2xl font-bold text-violet-700">{groups.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">{labels.noGroup}</p>
            <p className="text-2xl font-bold text-rose-500">{notInGroup}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">{lang === "vi" ? "Đã báp-têm" : "Baptized"}</p>
            <p className="text-2xl font-bold text-emerald-600">{contacts.filter(c => c.baptism).length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">{lang === "vi" ? "Thiếu nhi" : "Children"}</p>
            <p className="text-2xl font-bold text-amber-600">{contacts.filter(c => c.is_kid).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - all in one row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Age distribution */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">{labels.age}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ageData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} name={labels.count} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">{labels.gender}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={40}
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false} 
                  labelProps={{ fontSize: 10, fill: "#64748b" }}>
                  {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">{labels.marital}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={maritalData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={40}
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}
                  labelProps={{ fontSize: 10, fill: "#64748b" }}>
                  {maritalData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}