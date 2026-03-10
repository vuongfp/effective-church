import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Building2, Phone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import ChristianOrgForm from "@/components/organizations/ChristianOrgForm.jsx";

const FUNCTION_LABELS = {
  evangelism: { vi: "Truyền giáo", en: "Evangelism", fr: "Évangélisation" },
  education: { vi: "Giáo dục", en: "Education", fr: "Éducation" },
  social_work: { vi: "Công tác Xã hội", en: "Social Work", fr: "Travail social" },
  worship: { vi: "Thờ phượng", en: "Worship", fr: "Culte" },
  youth: { vi: "Thanh thiếu niên", en: "Youth", fr: "Jeunesse" },
  missions: { vi: "Truyền giáo", en: "Missions", fr: "Missions" },
  media: { vi: "Truyền thông", en: "Media", fr: "Médias" },
  other: { vi: "Khác", en: "Other", fr: "Autre" },
};

const FUNCTION_COLORS = {
  evangelism: "bg-orange-100 text-orange-700",
  education: "bg-blue-100 text-blue-700",
  social_work: "bg-emerald-100 text-emerald-700",
  worship: "bg-violet-100 text-violet-700",
  youth: "bg-pink-100 text-pink-700",
  missions: "bg-amber-100 text-amber-700",
  media: "bg-cyan-100 text-cyan-700",
  other: "bg-slate-100 text-slate-500",
};

export default function ChristianOrganizations() {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [filterFunction, setFilterFunction] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const [emergencySearch, setEmergencySearch] = useState("");
  const [emergencyCategory, setEmergencyCategory] = useState("all");

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ["christian_organizations"],
    queryFn: () => base44.entities.ChristianOrganization.list("-created_date"),
  });

  const { data: emergencyContacts = [] } = useQuery({
    queryKey: ["emergency_contacts"],
    queryFn: () => base44.entities.EmergencyContact.list("category"),
  });

  const emergencyCategories = useMemo(
    () => [...new Set(emergencyContacts.map(e => e.category).filter(Boolean))],
    [emergencyContacts]
  );

  const filteredEmergency = useMemo(() => emergencyContacts.filter(e => {
    const q = emergencySearch.toLowerCase();
    const matchSearch = e.name?.toLowerCase().includes(q) || e.phone?.toLowerCase().includes(q);
    const matchCat = emergencyCategory === "all" || e.category === emergencyCategory;
    return matchSearch && matchCat;
  }), [emergencyContacts, emergencySearch, emergencyCategory]);

  const filtered = useMemo(() => orgs.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = o.name?.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q);
    const matchFunc = filterFunction === "all" || o.function === filterFunction;
    return matchSearch && matchFunc;
  }), [orgs, search, filterFunction]);

  const getFuncLabel = (key) => FUNCTION_LABELS[key]?.[lang] || FUNCTION_LABELS[key]?.en || key;

  // Stats by function
  const byFunction = useMemo(() => Object.entries(
    orgs.reduce((acc, o) => { acc[o.function || "other"] = (acc[o.function || "other"] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]), [orgs]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {t("Christian Organizations", lang)}
          </h2>
          <p className="text-sm text-slate-500">{orgs.length} {t("organizations", lang)}</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          {t("Add Organization", lang)}
        </Button>
      </div>

      {/* Stats by function */}
      {byFunction.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {byFunction.map(([key, count]) => (
            <div key={key} className={`px-3 py-1.5 rounded-full text-sm font-medium ${FUNCTION_COLORS[key] || FUNCTION_COLORS.other}`}>
              {getFuncLabel(key)}: {count}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t("Search organizations...", lang)} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
        </div>
        <select value={filterFunction} onChange={e => setFilterFunction(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
          <option value="all">{t("All Functions", lang)}</option>
          {Object.keys(FUNCTION_LABELS).map(k => <option key={k} value={k}>{getFuncLabel(k)}</option>)}
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>{t("No organizations yet", lang)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(org => (
            <div key={org.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{org.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${FUNCTION_COLORS[org.function] || FUNCTION_COLORS.other}`}>
                      {getFuncLabel(org.function)}
                    </span>
                  </div>
                </div>
                <button onClick={() => { setEditing(org); setShowForm(true); }} className="text-xs text-slate-400 hover:text-violet-600 shrink-0">{t("Edit", lang)}</button>
              </div>
              {org.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{org.description}</p>}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                {org.contact_person && <span>👤 {org.contact_person}</span>}
                {org.phone && <span>📞 {org.phone}</span>}
                {org.email && <span>✉️ {org.email}</span>}
                {org.website && <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">🌐 {lang === "vi" ? "Website" : "Website"}</a>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Contacts Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">{lang === "vi" ? "Liên hệ khẩn cấp & Đường dây hỗ trợ" : lang === "fr" ? "Contacts d'urgence & Lignes d'assistance" : "Emergency Contacts & Help Lines"}</h3>
            <span className="text-xs text-slate-400">({filteredEmergency.length})</span>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                value={emergencySearch}
                onChange={e => setEmergencySearch(e.target.value)}
                placeholder={lang === "vi" ? "Tìm kiếm..." : lang === "fr" ? "Rechercher..." : "Search..."}
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 w-44"
              />
            </div>
            <select
               value={emergencyCategory}
               onChange={e => setEmergencyCategory(e.target.value)}
               className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
             >
               <option value="all">{lang === "vi" ? "Tất cả danh mục" : lang === "fr" ? "Toutes les catégories" : "All Categories"}</option>
               {emergencyCategories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>
        <div className="overflow-y-auto max-h-80">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 sticky top-0">
              <tr>
                <th className="text-left px-4 py-2.5 text-slate-200 font-semibold tracking-wide text-xs uppercase">{t("Category", lang)}</th>
                <th className="text-left px-4 py-2.5 text-slate-200 font-semibold tracking-wide text-xs uppercase">{t("Name", lang)}</th>
                <th className="text-left px-4 py-2.5 text-slate-200 font-semibold tracking-wide text-xs uppercase">{t("Phone", lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmergency.map(e => (
                <tr key={e.id} className="hover:bg-red-50/30">
                  <td className="px-4 py-2 text-xs text-slate-400">{e.category || "—"}</td>
                  <td className="px-4 py-2 font-medium text-slate-800">{e.name}</td>
                  <td className="px-4 py-2">
                    <a href={`tel:${e.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Phone className="w-3 h-3" />{e.phone}
                    </a>
                  </td>
                </tr>
              ))}
              {filteredEmergency.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">{lang === "vi" ? "Không tìm thấy kết quả" : lang === "fr" ? "Aucun résultat trouvé" : "No results found"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ChristianOrgForm
          open={showForm}
          onOpenChange={setShowForm}
          org={editing}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ["christian_organizations"] }); }}
        />
      )}
    </div>
  );
}