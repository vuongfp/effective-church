import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Users, CheckCircle2, XCircle, Edit, Tag, Briefcase, Heart, BookOpen, Activity, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "../components/contacts/ContactForm";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";
import { format, differenceInYears, parseISO } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const ACTIVITY_ICONS = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: BookOpen,
  task: CheckCircle2,
  event: Calendar,
};

const ACTIVITY_COLORS = {
  call: "bg-blue-100 text-blue-600",
  email: "bg-violet-100 text-violet-600",
  meeting: "bg-emerald-100 text-emerald-600",
  note: "bg-amber-100 text-amber-600",
  task: "bg-slate-100 text-slate-600",
  event: "bg-rose-100 text-rose-600",
};

const CATEGORY_COLORS = {
  evangelism: "bg-orange-100 text-orange-700",
  spiritual_enhancement: "bg-purple-100 text-purple-700",
  social_work: "bg-green-100 text-green-700",
  worship: "bg-blue-100 text-blue-700",
  kids: "bg-pink-100 text-pink-700",
  training: "bg-indigo-100 text-indigo-700",
  general: "bg-slate-100 text-slate-600",
};

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function MemberProfile() {
  const { lang } = useLang();
  const [showEdit, setShowEdit] = useState(false);
  const queryClient = useQueryClient();

  // Get member id from URL
  const urlParams = new URLSearchParams(window.location.search);
  const memberId = urlParams.get("id");

  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ["contact", memberId],
    queryFn: () => base44.entities.Contact.filter({ id: memberId }),
    select: (data) => data?.[0],
    enabled: !!memberId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities-for-member", memberId],
    queryFn: () => base44.entities.Activity.filter({ contact_id: memberId }, "-created_date"),
    enabled: !!memberId,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: () => base44.entities.Group.list(),
  });

  if (!memberId) {
    return (
      <div className="p-8 text-center text-slate-400">
        No member selected. <Link to={createPageUrl("ChurchMembers")} className="text-violet-600 underline">Go back</Link>
      </div>
    );
  }

  if (memberLoading) {
    return <div className="p-8 space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}</div>;
  }

  if (!member) {
    return <div className="p-8 text-center text-slate-400">Member not found.</div>;
  }

  // Helper function to parse date strings with various formats
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Try ISO format first
      const parsed = parseISO(dateStr);
      if (!isNaN(parsed.getTime())) return parsed;
      
      // Try parsing DD-MMM-YY format (e.g., "18-Jan-08")
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const monthStr = parts[1];
        const year = parseInt(parts[2]);
        
        const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        const month = months[monthStr];
        
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
          // Handle 2-digit years
          const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
          return new Date(fullYear, month, day);
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const birthDate = parseDate(member.birthday);
  const age = birthDate && !isNaN(birthDate.getTime()) ? differenceInYears(new Date(), birthDate) : null;

  // Groups this member belongs to
  const memberGroups = groups.filter(g =>
    (g.member_ids || []).includes(member.id) ||
    (member.groups || []).some(mg => g.name === mg)
  );

  const memberSince = member.member_since ? format(parseISO(member.member_since), "MMM d, yyyy") : null;

  const MARITAL = { Single: { en: "Single", vi: "Độc thân", fr: "Célibataire" }, Married: { en: "Married", vi: "Kết hôn", fr: "Marié(e)" }, Widowed: { en: "Widowed", vi: "Góa", fr: "Veuf/Veuve" }, Divorced: { en: "Divorced", vi: "Ly hôn", fr: "Divorcé(e)" } };
  const PROF_LABELS = { student: "Student", teacher: "Teacher", engineer: "Engineer", doctor: "Doctor", nurse: "Nurse", business: "Business", farmer: "Farmer", clergy: "Clergy", artist: "Artist", lawyer: "Lawyer", accountant: "Accountant", it: "IT", social_worker: "Social Worker", homemaker: "Homemaker", retired: "Retired", unemployed: "Unemployed", other: "Other" };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link to={createPageUrl("ChurchMembers")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("Members", lang)}
        </Link>
      </div>

      {/* Hero card */}
      <Card className="border-violet-100">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-violet-100 flex items-center justify-center text-3xl font-bold text-violet-600 shrink-0">
              {member.first_name?.[0]}{member.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{member.first_name} {member.last_name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full ${member.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {member.status === "active" ? t("Active", lang) : t("Inactive", lang)}
                </span>
              </div>
              {member.role && <p className="text-slate-500 mt-0.5">{member.role}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {member.baptism && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> {t("Baptized", lang)}
                  </span>
                )}
                {age !== null && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{age} yrs old</span>
                )}
                {member.sex && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${member.sex === "M" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"}`}>
                    {member.sex === "M" ? t("Male", lang) : t("Female", lang)}
                  </span>
                )}
                {memberSince && (
                  <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> {lang === "vi" ? "Thành viên từ" : lang === "fr" ? "Membre depuis" : "Member since"} {memberSince}
                  </span>
                )}
              </div>
            </div>
            <Button onClick={() => setShowEdit(true)} className="bg-violet-600 hover:bg-violet-700 shrink-0">
              <Edit className="w-4 h-4 mr-2" /> {t("Edit", lang)}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Contact Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                {lang === "vi" ? "Thông tin liên hệ" : lang === "fr" ? "Coordonnées" : "Contact Info"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={Mail} label="Email" value={member.email} />
              <InfoRow icon={Phone} label={t("Phone", lang)} value={member.phone} />
              <InfoRow icon={MapPin} label={t("Address", lang)} value={member.address} />
              <InfoRow icon={Calendar} label={t("Birthday", lang)} value={member.birthday} />
              <InfoRow icon={Heart} label={t("Marital Status", lang)} value={MARITAL[member.marital_status]?.[lang] || member.marital_status} />
              <InfoRow icon={Briefcase} label={lang === "vi" ? "Nghề nghiệp" : lang === "fr" ? "Profession" : "Profession"} value={PROF_LABELS[member.profession] || member.profession} />
            </CardContent>
          </Card>

          {/* Groups */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-violet-500" />
                {lang === "vi" ? "Nhóm / Tế bào" : lang === "fr" ? "Groupes" : "Groups"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {memberGroups.length === 0 ? (
                <p className="text-xs text-slate-400">{lang === "vi" ? "Chưa thuộc nhóm nào" : lang === "fr" ? "Aucun groupe" : "No groups assigned"}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {memberGroups.map(g => (
                    <span key={g.id} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{g.name}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {member.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  {t("Notes", lang)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{member.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Activity History */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-500" />
                {lang === "vi" ? "Lịch sử hoạt động" : lang === "fr" ? "Historique des activités" : "Activity History"}
                <span className="ml-auto text-xs font-normal text-slate-400">{activities.length} {lang === "vi" ? "hoạt động" : lang === "fr" ? "activités" : "activities"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Activity className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">{lang === "vi" ? "Chưa có hoạt động" : lang === "fr" ? "Aucune activité" : "No activities yet"}</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
                  <div className="space-y-4 pl-12">
                    {activities.map((act) => {
                      const Icon = ACTIVITY_ICONS[act.type] || Activity;
                      return (
                        <div key={act.id} className="relative">
                          {/* Icon on timeline */}
                          <div className={`absolute -left-8 w-8 h-8 rounded-full flex items-center justify-center ${ACTIVITY_COLORS[act.type] || "bg-slate-100 text-slate-500"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 hover:bg-violet-50/40 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800">{act.subject}</p>
                                {act.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{act.description}</p>}
                                {act.event_category && (
                                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[act.event_category] || "bg-slate-100 text-slate-500"}`}>
                                    {act.event_category}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${ACTIVITY_COLORS[act.type] || "bg-slate-100 text-slate-500"}`}>
                                  {act.type}
                                </span>
                                {act.completed && (
                                  <span className="text-xs text-emerald-600 flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3 h-3" /> Done
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {act.created_date ? format(new Date(act.created_date), "MMM d, yyyy") : "—"}</span>
                              {act.due_date && <span>Due: {act.due_date}</span>}
                              {act.location && <span>📍 {act.location}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ContactForm
        open={showEdit}
        onOpenChange={setShowEdit}
        contact={member}
        onSaved={() => { setShowEdit(false); queryClient.invalidateQueries({ queryKey: ["contact", memberId] }); queryClient.invalidateQueries({ queryKey: ["contacts"] }); }}
      />
    </div>
  );
}