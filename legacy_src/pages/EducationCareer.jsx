import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, BookOpen, Users, CheckCircle2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import TrainingProgramForm from "@/components/education/TrainingProgramForm.jsx";

const CATEGORY_LABELS = {
  discipleship: { vi: "Môn đồ hóa", en: "Discipleship", fr: "Discipolat" },
  leadership: { vi: "Lãnh đạo", en: "Leadership", fr: "Leadership" },
  ministry: { vi: "Chức vụ", en: "Ministry", fr: "Ministère" },
  vocational: { vi: "Nghề nghiệp", en: "Vocational", fr: "Professionnel" },
  youth: { vi: "Thanh thiếu niên", en: "Youth", fr: "Jeunesse" },
  other: { vi: "Khác", en: "Other", fr: "Autre" },
};

const STATUS_COLORS = {
  upcoming: "bg-amber-100 text-amber-700",
  ongoing: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const PROFESSION_LABELS = {
  en: { student: "Student", teacher: "Teacher", engineer: "Engineer", doctor: "Doctor", nurse: "Nurse", business: "Business", farmer: "Farmer", clergy: "Clergy", artist: "Artist", lawyer: "Lawyer", accountant: "Accountant", it: "IT", social_worker: "Social Worker", homemaker: "Homemaker", retired: "Retired", unemployed: "Unemployed", other: "Other" },
  vi: { student: "Học sinh/SV", teacher: "Giáo viên", engineer: "Kỹ sư", doctor: "Bác sĩ", nurse: "Y tá", business: "Kinh doanh", farmer: "Nông dân", clergy: "Mục sư", artist: "Nghệ sĩ", lawyer: "Luật sư", accountant: "Kế toán", it: "CNTT", social_worker: "NV Xã hội", homemaker: "Nội trợ", retired: "Hưu", unemployed: "Thất nghiệp", other: "Khác" },
  fr: { student: "Étudiant", teacher: "Enseignant", engineer: "Ingénieur", doctor: "Médecin", nurse: "Infirmier", business: "Commerce", farmer: "Agriculteur", clergy: "Clergé", artist: "Artiste", lawyer: "Avocat", accountant: "Comptable", it: "Informatique", social_worker: "Travailleur social", homemaker: "Au foyer", retired: "Retraité", unemployed: "Sans emploi", other: "Autre" },
};
const COLORS = ["#7c3aed","#2563eb","#059669","#d97706","#dc2626","#db2777","#0891b2","#65a30d","#9333ea","#ea580c"];

export default function EducationCareer() {
   const { lang } = useLang();
   const [search, setSearch] = useState("");
   const [showForm, setShowForm] = useState(false);
   const [editing, setEditing] = useState(null);
   const [addingMembersToId, setAddingMembersToId] = useState(null);
   const [selectedMembers, setSelectedMembers] = useState([]);
   const [memberSearch, setMemberSearch] = useState("");
   const [selectedMemberForModal, setSelectedMemberForModal] = useState(null);
   const queryClient = useQueryClient();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["training_programs"],
    queryFn: () => base44.entities.TrainingProgram.list("-created_date"),
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => base44.entities.Contact.list(),
  });

  const professionData = Object.entries(
    contacts.reduce((acc, c) => { if (c.profession) acc[c.profession] = (acc[c.profession] || 0) + 1; return acc; }, {})
  ).map(([key, value]) => ({ name: (PROFESSION_LABELS[lang] || PROFESSION_LABELS.en)[key] || key, value })).sort((a, b) => b.value - a.value);

  const filtered = programs.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  const getCatLabel = (key) => CATEGORY_LABELS[key]?.[lang] || CATEGORY_LABELS[key]?.en || key;

  const addMembersToProgram = useMutation({
    mutationFn: async ({ programId, memberIds }) => {
      const program = programs.find(p => p.id === programId);
      const updated = {
        ...program,
        enrolled_contact_ids: [...new Set([...(program.enrolled_contact_ids || []), ...memberIds])]
      };
      return base44.entities.TrainingProgram.update(programId, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training_programs"] });
      setAddingMembersToId(null);
      setSelectedMembers([]);
    },
  });

  const currentProgram = useMemo(() => programs.find(p => p.id === addingMembersToId), [programs, addingMembersToId]);
  const enrolledIds = useMemo(() => currentProgram?.enrolled_contact_ids || [], [currentProgram]);
  const availableMembers = useMemo(() => {
    const all = contacts.filter(c => !enrolledIds.includes(c.id));
    if (!memberSearch.trim()) return [];
    return all.filter(c => 
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(memberSearch.toLowerCase())
    );
  }, [contacts, enrolledIds, memberSearch]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {t("Education / Career", lang)}
          </h2>
          <p className="text-sm text-slate-500">{programs.length} {t("programs", lang)}</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          {t("Add Program", lang)}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t("Total Programs", lang), value: programs.length, icon: BookOpen, color: "text-violet-600 bg-violet-50" },
          { label: t("Ongoing", lang), value: programs.filter(p => p.status === "ongoing").length, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
          { label: t("Completed", lang), value: programs.filter(p => p.status === "completed").length, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-xl p-4 flex items-center gap-3`}>
            <s.icon className="w-5 h-5" />
            <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs opacity-70">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Profession Chart */}
      {professionData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-4">{t("Members by Profession", lang)}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={professionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                {professionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Programs List */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t("Search programs...", lang)} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
        </div>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)
        ) : filtered.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-800">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || ""}`}>{p.status}</span>
                  <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">{getCatLabel(p.category)}</span>
                </div>
                <div className="flex gap-4 mt-1 text-xs text-slate-400">
                  {p.instructor && <span>👤 {p.instructor}</span>}
                  {p.start_date && <span>📅 {p.start_date}{p.end_date ? ` → ${p.end_date}` : ""}</span>}
                  <span><Users className="w-3 h-3 inline mr-0.5" />{(p.enrolled_contact_ids || []).length} {t("enrolled", lang)} / {(p.completed_contact_ids || []).length} {t("completed_prog", lang)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddingMembersToId(p.id)} className="text-xs text-slate-400 hover:text-blue-600 font-medium">{t("Members", lang)}</button>
                <button onClick={() => { setEditing(p); setShowForm(true); }} className="text-xs text-slate-400 hover:text-violet-600">{t("Edit", lang)}</button>
              </div>
            </div>
            {addingMembersToId === p.id && (
              <div className="border-t pt-3 space-y-3">
                {enrolledIds.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2 font-medium">{t("Already enrolled", lang)}:</p>
                    <div className="flex flex-wrap gap-2">
                      {contacts.filter(c => enrolledIds.includes(c.id)).map(member => (
                        <button
                          key={member.id}
                          onClick={() => setSelectedMemberForModal(member)}
                          className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                        >
                          {member.first_name} {member.last_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMembers.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2 font-medium">{t("To add", lang)}:</p>
                    <div className="flex flex-wrap gap-2">
                      {contacts.filter(c => selectedMembers.includes(c.id)).map(member => (
                        <button
                          key={member.id}
                          onClick={() => setSelectedMembers(s => s.filter(id => id !== member.id))}
                          className="text-xs px-2 py-1 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center gap-1"
                        >
                          {member.first_name} {member.last_name}
                          <X className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder={t("Search members...", lang)}
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
                {memberSearch.trim() && (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {availableMembers.length > 0 ? (
                      [...availableMembers].sort((a, b) => {
                        const aSelected = selectedMembers.includes(a.id);
                        const bSelected = selectedMembers.includes(b.id);
                        return bSelected - aSelected;
                      }).map(member => (
                        <button
                          key={member.id}
                          onClick={() => setSelectedMembers(s => s.includes(member.id) ? s.filter(id => id !== member.id) : [...s, member.id])}
                          className={`text-xs px-2 py-1 rounded-full transition-colors ${
                            selectedMembers.includes(member.id)
                              ? "bg-violet-600 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {member.first_name} {member.last_name}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">{t("No results found", lang)}</p>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => addMembersToProgram.mutate({ programId: p.id, memberIds: selectedMembers })}
                    disabled={selectedMembers.length === 0}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {t("Add", lang)}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setAddingMembersToId(null); setSelectedMembers([]); setMemberSearch(""); }}
                  >
                    {t("Cancel", lang)}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-10 text-slate-400">{t("No programs yet", lang)}</div>
        )}
      </div>

      {showForm && (
        <TrainingProgramForm
          open={showForm}
          onOpenChange={setShowForm}
          program={editing}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ["training_programs"] }); }}
        />
      )}

      {selectedMemberForModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-96 overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <Link to={createPageUrl("MemberProfile") + `?id=${selectedMemberForModal.id}`} className="text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline">
                    {selectedMemberForModal.first_name} {selectedMemberForModal.last_name}
                  </Link>
                  <p className="text-sm text-slate-500">{selectedMemberForModal.profession}</p>
                </div>
                <button onClick={() => setSelectedMemberForModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                {selectedMemberForModal.email && <div><span className="text-slate-500">Email:</span> {selectedMemberForModal.email}</div>}
                {selectedMemberForModal.phone && <div><span className="text-slate-500">Phone:</span> {selectedMemberForModal.phone}</div>}
                {selectedMemberForModal.marital_status && <div><span className="text-slate-500">Status:</span> {selectedMemberForModal.marital_status}</div>}
                {selectedMemberForModal.address && <div><span className="text-slate-500">Address:</span> {selectedMemberForModal.address}</div>}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}