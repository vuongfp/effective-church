import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Baby, Search, ChevronUp, ChevronDown } from "lucide-react";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import MemberMapView from "@/components/church/MemberMapView";
import MemberForm from "@/components/church/MemberForm";

const AGE_GROUPS = [
  { label: "0-5", min: 0, max: 5 },
  { label: "6-12", min: 6, max: 12 },
];

function getAge(birthday) {
  if (!birthday) return null;
  const today = new Date();
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

const COLORS = ["#7c3aed", "#db2777", "#2563eb", "#059669", "#d97706"];

export default function KidChurch() {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [sortField, setSortField] = useState("first_name");
  const [sortDir, setSortDir] = useState("asc");
  const [editingKid, setEditingKid] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => base44.entities.Contact.list(),
  });
  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-due_date"),
  });

  // Kids: age < 13 or is_kid flag
  const kids = contacts.filter(c => {
    if (c.is_kid) return true;
    const age = getAge(c.birthday);
    return age !== null && age <= 12;
  });

  const ageData = AGE_GROUPS.map(g => ({
    name: g.label,
    total: kids.filter(c => { const a = getAge(c.birthday); return a !== null && a >= g.min && a <= g.max; }).length,
    male: kids.filter(c => { const a = getAge(c.birthday); return a !== null && a >= g.min && a <= g.max && c.sex === "M"; }).length,
    female: kids.filter(c => { const a = getAge(c.birthday); return a !== null && a >= g.min && a <= g.max && c.sex === "F"; }).length,
  }));

  const genderData = [
    { name: t("Male", lang), value: kids.filter(c => c.sex === "M").length },
    { name: t("Female", lang), value: kids.filter(c => c.sex === "F").length },
  ];

  const kidActivities = activities.filter(a => a.event_category === "kids");

  const filteredKids = useMemo(() => {
    let list = [...kids];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(q));
    }
    if (filterGender !== "all") list = list.filter(c => c.sex === filterGender);
    if (filterAge !== "all") {
      const [min, max] = filterAge.split("-").map(Number);
      list = list.filter(c => { const a = getAge(c.birthday); return a !== null && a >= min && a <= max; });
    }
    list.sort((a, b) => {
      let va = sortField === "age" ? (getAge(a.birthday) ?? -1) : (a[sortField] || "").toLowerCase();
      let vb = sortField === "age" ? (getAge(b.birthday) ?? -1) : (b[sortField] || "").toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [kids, search, filterGender, filterAge, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => sortField === field
    ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />)
    : null;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {t("Kid Church", lang)}
          </h2>
          <p className="text-sm text-slate-500">{kids.length} {t("children", lang)}</p>
        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t("Total Children", lang), value: kids.length, color: "bg-violet-50 text-violet-600" },
          { label: t("Male", lang), value: kids.filter(c => c.sex === "M").length, color: "bg-blue-50 text-blue-600" },
          { label: t("Female", lang), value: kids.filter(c => c.sex === "F").length, color: "bg-pink-50 text-pink-600" },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-xl p-4 flex items-center gap-3`}>
            <Baby className="w-5 h-5" />
            <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs opacity-70">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Age Chart */}
         <div className="bg-white rounded-xl border border-slate-200 p-4">
           <h3 className="font-semibold text-slate-800 mb-4">{t("Age Distribution", lang)}</h3>
           <ResponsiveContainer width="100%" height={280}>
             <BarChart data={ageData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
               <XAxis dataKey="name" tick={{ fontSize: 12 }} />
               <YAxis tick={{ fontSize: 12 }} />
               <Tooltip />
               <Legend />
               <Bar dataKey="male" name={t("Male", lang)} fill="#2563eb" radius={[4,4,0,0]} />
               <Bar dataKey="female" name={t("Female", lang)} fill="#db2777" radius={[4,4,0,0]} />
             </BarChart>
           </ResponsiveContainer>
         </div>

         {/* Gender Chart */}
         <div className="bg-white rounded-xl border border-slate-200 p-4">
           <h3 className="font-semibold text-slate-800 mb-4">{t("Gender", lang)}</h3>
           <ResponsiveContainer width="100%" height={300}>
             <PieChart margin={{ top: 10, right: 100, left: 100, bottom: 10 }}>
               <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={({ name, value }) => `${name}: ${value}`} labelLine={true}>
                 {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
               </Pie>
               <Tooltip />
             </PieChart>
           </ResponsiveContainer>
         </div>
       </div>

      {/* Kid Activities */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 mb-4">{t("Kid Activities", lang)}</h3>
        {kidActivities.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">{t("No kid activities yet", lang)}</p>
        ) : (
          <div className="space-y-2">
            {kidActivities.map(a => (
              <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-violet-50">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{a.subject}</p>
                  {a.due_date && <p className="text-xs text-slate-400">📅 {a.due_date}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {a.completed ? t("Done", lang) : t("Upcoming", lang)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map + List side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Children Map <span className="text-slate-400 text-xs font-normal">({filteredKids.length})</span></h3>
          <MemberMapView
            members={filteredKids}
            onMemberUpdated={() => queryClient.invalidateQueries({ queryKey: ["contacts"] })}
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}</div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 space-y-2">
              <h3 className="font-semibold text-slate-800">{t("Children List", lang)} <span className="text-slate-400 text-xs font-normal">({filteredKids.length})</span></h3>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   placeholder={lang === "vi" ? "Tìm theo tên..." : lang === "fr" ? "Rechercher par nom..." : "Search by name..."}
                   className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
                 />
              </div>
              <div className="flex gap-2">
                <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none">
                   <option value="all">{lang === "vi" ? "Tất cả giới tính" : lang === "fr" ? "Tous les genres" : "All Gender"}</option>
                   <option value="M">{t("Male", lang)}</option>
                   <option value="F">{t("Female", lang)}</option>
                 </select>
                 <select value={filterAge} onChange={e => setFilterAge(e.target.value)} className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none">
                   <option value="all">{lang === "vi" ? "Tất cả độ tuổi" : lang === "fr" ? "Tous les âges" : "All Ages"}</option>
                   <option value="0-5">0–5</option>
                   <option value="6-12">6–12</option>
                 </select>
              </div>
            </div>
            <div className="overflow-y-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">#</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium cursor-pointer hover:text-slate-800" onClick={() => toggleSort("first_name")}>
                      {t("Name", lang)}<SortIcon field="first_name" />
                    </th>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium cursor-pointer hover:text-slate-800" onClick={() => toggleSort("sex")}>
                      {t("Gender", lang)}<SortIcon field="sex" />
                    </th>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium cursor-pointer hover:text-slate-800" onClick={() => toggleSort("age")}>
                      {t("Age", lang)}<SortIcon field="age" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKids.map((c, i) => (
                    <tr key={c.id} className="hover:bg-violet-50/30">
                      <td className="px-4 py-2 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-2 font-medium text-violet-700 cursor-pointer hover:underline" onClick={() => { setEditingKid(c); setShowEditForm(true); }}>{c.first_name} {c.last_name}</td>
                      <td className="px-4 py-2 text-slate-500">{c.sex === "M" ? `♂ ${t("Male", lang)}` : c.sex === "F" ? `♀ ${t("Female", lang)}` : "—"}</td>
                      <td className="px-4 py-2 text-slate-500">{getAge(c.birthday) ?? "—"}</td>
                    </tr>
                  ))}
                  {filteredKids.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400 text-sm">{lang === "vi" ? "Không tìm thấy trẻ em" : lang === "fr" ? "Aucun enfant trouvé" : "No children found"}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    {showEditForm && (
        <MemberForm
          open={showEditForm}
          onOpenChange={setShowEditForm}
          member={editingKid}
          onSaved={() => { setShowEditForm(false); queryClient.invalidateQueries({ queryKey: ["contacts"] }); }}
        />
      )}
    </div>
  );
}