"use client";
import React, { useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search, Phone, Mail, Tag, Download, Upload, Map, LayoutGrid, ChevronUp, ChevronDown, ChevronsUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MemberForm from "@/components/church/MemberForm";
import ContactCSVImport from "@/components/contacts/ContactCSVImport";
import EmptyState from "@/components/shared/EmptyState";
import MemberMapView from "@/components/church/MemberMapView";
import BirthdayNotifications from "@/components/church/BirthdayNotifications";
import MemberStatsCharts from "@/components/church/MemberStatsCharts";
import SmallGroupsTab from "@/components/church/SmallGroupsTab";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import { createPageUrl } from "@/utils";
import Link from "next/link";

const STATUS_LABELS = {
  en: { active: "Active", inactive: "Inactive" },
  vi: { active: "Hoạt động", inactive: "Không HĐ" },
  fr: { active: "Actif", inactive: "Inactif" },
};
const MARITAL_LABELS = {
  en: { Single: "Single", Married: "Married", Widowed: "Widowed", Divorced: "Divorced" },
  vi: { Single: "Độc thân", Married: "Đã kết hôn", Widowed: "Góa", Divorced: "Ly hôn" },
  fr: { Single: "Célibataire", Married: "Marié(e)", Widowed: "Veuf/Veuve", Divorced: "Divorcé(e)" },
};

interface SortIconProps {
  col: string;
  sortCol: string;
  sortDir: "asc" | "desc";
}

function SortIcon({ col, sortCol, sortDir }: SortIconProps) {
  if (sortCol !== col) return <ChevronsUpDown className="w-3 h-3 text-slate-300" />;
  return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-violet-600" /> : <ChevronDown className="w-3 h-3 text-violet-600" />;
}

const STATUS_COLORS = { active: "bg-emerald-100 text-emerald-700", inactive: "bg-slate-100 text-slate-500" };

function calcAge(birthday: string | null | undefined): number | null {
  if (!birthday) return null;
  const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const today = new Date();
  let d = new Date(birthday);
  // Handle "D-Mon-YY" or "DD-Mon-YYYY" format
  if (isNaN(d.getTime()) || d.getFullYear() < 1900) {
    const parts = birthday.split(/[-\/\s]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const mon = months[parts[1].toLowerCase().slice(0, 3)];
      let yr = parseInt(parts[2]);
      if (!isNaN(yr) && mon !== undefined) {
        if (yr < 100) yr = yr >= 26 ? 1900 + yr : 2000 + yr;
        d = new Date(yr, mon, day);
      }
    }
  }
  if (isNaN(d.getTime())) return null;
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  sex: string | null;
  marital_status: string | null;
  birthday: string | null;
  baptism: boolean;
  address: string | null;
  status: string;
  created_at: string;
}

export default function ChurchMembers() {
  const supabase = createClient();
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState("members");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [sortCol, setSortCol] = useState<string>("first_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterSex, setFilterSex] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMarital, setFilterMarital] = useState<string>("all");
  const [filterBaptism, setFilterBaptism] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const ITEMS_PER_PAGE = 50;

  const { data: contacts = [], isLoading } = useQuery<Member[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from('groups').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    let arr = contacts.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = (
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.address?.toLowerCase().includes(q)
      );
      const matchSex = filterSex === "all" || c.sex === filterSex;
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      const matchMarital = filterMarital === "all" || c.marital_status === filterMarital;
      const matchBaptism = filterBaptism === "all" || (filterBaptism === "yes" ? c.baptism : !c.baptism);
      return matchSearch && matchSex && matchStatus && matchMarital && matchBaptism;
    });
    arr = [...arr].sort((a, b) => {
      let va = a[sortCol] ?? "";
      let vb = b[sortCol] ?? "";
      if (typeof va === "boolean") va = va ? 1 : 0;
      if (typeof vb === "boolean") vb = vb ? 1 : 0;
      // Sort by age (computed)
      if (sortCol === "_age") {
        const ageA = calcAge(a.birthday) ?? -1;
        const ageB = calcAge(b.birthday) ?? -1;
        return sortDir === "asc" ? ageA - ageB : ageB - ageA;
      }
      // Sort birthday as actual dates
      if (sortCol === "birthday") {
        const da = va ? new Date(va).getTime() : 0;
        const db = vb ? new Date(vb).getTime() : 0;
        if (isNaN(da) || da === 0) return 1;
        if (isNaN(db) || db === 0) return -1;
        return sortDir === "asc" ? da - db : db - da;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [contacts, search, sortCol, sortDir, filterSex, filterStatus, filterMarital, filterBaptism]);

  const exportCSV = useCallback(() => {
    const headers = ["first_name", "last_name", "email", "phone", "company", "role", "address", "relationship", "favorite_channel", "groups", "status", "notes"];
    const rows = [headers.join(",")];
    filtered.forEach((c: any) => {
      rows.push(headers.map(h => {
        let v = c[h] ?? "";
        if (Array.isArray(v)) v = v.join(";");
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(","));
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "members.csv"; a.click();
  }, [filtered]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedData = useMemo(() => filtered.slice(startIdx, endIdx), [filtered, startIdx, endIdx]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "members"
            ? "border-violet-600 text-violet-600"
            : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
        >
          {t("Members", lang)}
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "groups"
            ? "border-violet-600 text-violet-600"
            : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
        >
          {t("Small Groups / Ministry", lang)}
        </button>
      </div>

      {activeTab === "members" && (
        <>
          {/* Birthday / Anniversary Notifications */}
          <BirthdayNotifications />
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t("Members", lang)}</h2>
              <p className="text-sm text-slate-500">{contacts.length} {t("members", lang)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-2" /> {lang === "vi" ? "Xuất CSV" : lang === "fr" ? "Exporter CSV" : "Export CSV"}
              </Button>
              <Button variant="outline" onClick={() => setCsvOpen(true)}>
                <Upload className="w-4 h-4 mr-2" /> {lang === "vi" ? "Nhập CSV" : lang === "fr" ? "Importer CSV" : "Import CSV"}
              </Button>
              <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-2" /> {t("Add Member", lang)}
              </Button>
            </div>
          </div>
        </>
      )}

      {activeTab === "members" && (
        <>
          {/* Stats Cards + Map (before table) */}
          {contacts.length > 0 && (
            <>
              <MemberStatsCharts contacts={contacts} groups={groups} />
              <MemberMapView members={filtered} groups={groups} onMemberUpdated={() => queryClient.invalidateQueries({ queryKey: ["contacts"] })} />
            </>
          )}

          {/* Search + Filters (before table) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder={t("Search members...", lang)} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
            </div>
            <select value={filterSex} onChange={e => setFilterSex(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="all">{t("Gender", lang)}</option>
              <option value="M">{t("Male", lang)}</option>
              <option value="F">{t("Female", lang)}</option>
            </select>
            <select value={filterMarital} onChange={e => setFilterMarital(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="all">{t("Marital Status", lang)}</option>
              <option value="Single">{t("Single", lang)}</option>
              <option value="Married">{t("Married", lang)}</option>
              <option value="Widowed">{t("Widowed", lang)}</option>
              <option value="Divorced">{t("Divorced", lang)}</option>
            </select>
            <select value={filterBaptism} onChange={e => setFilterBaptism(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="all">{t("Baptism", lang)}</option>
              <option value="yes">{t("Baptized", lang)}</option>
              <option value="no">{t("Not Baptized", lang)}</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="all">{t("Status", lang)}</option>
              <option value="active">{t("Active", lang)}</option>
              <option value="inactive">{t("Inactive", lang)}</option>
            </select>
            <span className="text-sm text-slate-400">{filtered.length} {t("members", lang)}</span>
            {totalPages > 1 && <span className="text-sm text-slate-400">{currentPage}/{totalPages}</span>}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title={t("No members yet", lang)} description={t("Add your first church member.", lang)} actionLabel={t("Add Member", lang)} onAction={() => { setEditing(null); setShowForm(true); }} />
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-500 w-10">#</th>
                      {[
                        { col: "first_name", label: t("Name", lang) },
                        { col: "sex", label: t("Gender", lang) },
                        { col: "marital_status", label: t("Marital Status", lang) },
                        { col: "birthday", label: t("Birthday", lang) },
                        { col: "_age", label: lang === "vi" ? "Tuổi" : lang === "fr" ? "Âge" : "Age" },
                        { col: "baptism", label: t("Baptism", lang) },
                        { col: "email", label: t("Email", lang) },
                        { col: "phone", label: t("Phone", lang) },
                        { col: "address", label: t("Address", lang) },
                        { col: "status", label: t("Status", lang) },
                      ].map(({ col, label }) => (
                        <th key={col} className="text-left px-3 py-3 font-medium text-slate-500 whitespace-nowrap cursor-pointer hover:text-slate-800" onClick={() => toggleSort(col)}>
                          <div className="flex items-center gap-1">
                            {label}
                            <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
                          </div>
                        </th>
                      ))}
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-violet-50/40 transition-colors">
                        <td className="px-4 py-3 text-slate-400 text-xs">{startIdx + idx + 1}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                              {c.first_name?.[0]}{c.last_name?.[0]}
                            </div>
                            <Link
                              href={createPageUrl(`MemberProfile?id=${c.id}`)}
                              className="font-medium text-slate-900 whitespace-nowrap hover:text-violet-600 hover:underline transition-colors text-left"
                            >
                              {c.first_name} {c.last_name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-500">
                          {c.sex === "M" ? <span className="text-blue-600">♂ {t("Male", lang)}</span> : c.sex === "F" ? <span className="text-pink-600">♀ {t("Female", lang)}</span> : "—"}
                        </td>
                        <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{(MARITAL_LABELS[lang] || MARITAL_LABELS.en)[c.marital_status] || c.marital_status || "—"}</td>
                        <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{c.birthday || "—"}</td>
                        <td className="px-3 py-3 text-slate-500 whitespace-nowrap text-center">{calcAge(c.birthday) ?? "—"}</td>
                        <td className="px-3 py-3">
                          {c.baptism ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">✓ {t("Baptized", lang)}</span> : <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t("Not Baptized", lang)}</span>}
                        </td>
                        <td className="px-3 py-3 text-slate-500 max-w-[180px] truncate">{c.email || "—"}</td>
                        <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{c.phone || "—"}</td>
                        <td className="px-3 py-3 text-slate-500 max-w-[160px] truncate">{c.address || "—"}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || STATUS_COLORS.active}`}>
                            {(STATUS_LABELS[lang] || STATUS_LABELS.en)[c.status] || c.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button onClick={() => { setEditing(c); setShowForm(true); }} className="text-xs text-slate-400 hover:text-violet-600 transition-colors">{t("Edit", lang)}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  {lang === "vi" ? "Hiển thị" : lang === "fr" ? "Affichage" : "Showing"} {startIdx + 1}–{Math.min(endIdx, filtered.length)} {lang === "vi" ? "của" : lang === "fr" ? "de" : "of"} {filtered.length} {t("members", lang)}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded border border-slate-200 text-xs text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← {lang === "vi" ? "Trước" : lang === "fr" ? "Préc." : "Prev"}
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-2 py-1 rounded text-xs transition-colors ${currentPage === pageNum
                            ? "bg-violet-600 text-white"
                            : "border border-slate-200 text-slate-600 hover:bg-white"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded border border-slate-200 text-xs text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {lang === "vi" ? "Tiếp" : lang === "fr" ? "Suiv." : "Next"} →
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "groups" && (
        <SmallGroupsTab contacts={contacts} />
      )}

      <MemberForm
        open={showForm}
        onOpenChange={setShowForm}
        member={editing}
        onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ["contacts"] }); }}
      />
      <ContactCSVImport
        open={csvOpen}
        onOpenChange={setCsvOpen}
        onImported={() => queryClient.invalidateQueries({ queryKey: ["contacts"] })}
      />
    </div>
  );
}