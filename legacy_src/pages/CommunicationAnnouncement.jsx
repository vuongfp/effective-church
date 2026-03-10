import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pin, Megaphone, Send, Mail, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import AnnouncementForm from "@/components/communication/AnnouncementForm.jsx";
const defaultLang = "en";

const SENT_MESSAGES = [
  { id: 1, subject: { en: "Sunday worship reminder", vi: "Nhắc nhở thờ phượng Chủ nhật" }, type: "sms", sent_to: 165, date: "23/02/2025", status: "sent" },
  { id: 2, subject: { en: "Cell group meeting this Friday", vi: "Thông báo nhóm tế bào thứ Sáu" }, type: "email", sent_to: 165, date: "18/02/2025", status: "sent" },
  { id: 3, subject: { en: "February birthday greetings", vi: "Chúc mừng sinh nhật tháng 2 — Hội Thánh yêu thương bạn!" }, type: "sms", sent_to: 12, date: "01/02/2025", status: "sent" },
  { id: 4, subject: { en: "C&MA District Conference 2025", vi: "Thông báo Đại hội Địa Hạt C&MA 2025" }, type: "email", sent_to: 165, date: "10/01/2025", status: "sent" },
  { id: 5, subject: { en: "Year-end finance report 2025", vi: "Báo cáo tài chính cuối năm 2025" }, type: "email", sent_to: 165, date: "05/01/2025", status: "sent" },
];

const CHANNEL_COLORS = {
  internal: "bg-slate-100 text-slate-600",
  email: "bg-blue-100 text-blue-700",
  sms: "bg-green-100 text-green-700",
  whatsapp: "bg-emerald-100 text-emerald-700",
};

export default function CommunicationAnnouncement() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState("announcements");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("sms");
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.list("-created_date"),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => base44.entities.Contact.list(),
  });

  const filtered = announcements.filter(a =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.content?.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter(a => a.pinned);
  const regular = filtered.filter(a => !a.pinned);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("announcements")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "announcements"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          {t("Announcements", lang)}
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "messages"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          {t("Messages", lang)}
        </button>
      </div>

      {activeTab === "announcements" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {t("Announcements", lang)}
              </h2>
              <p className="text-sm text-slate-500">{announcements.length} {t("announcements", lang)}</p>
            </div>
            <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              {t("New Announcement", lang)}
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder={t("Search announcements...", lang)} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-72" />
          </div>
        </>
      )}

      {activeTab === "announcements" && (
        <>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-6">
              {/* Pinned */}
              {pinned.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-slate-700">{t("Pinned", lang)}</span>
                  </div>
                  <div className="space-y-3">
                    {pinned.map(a => <AnnouncementCard key={a.id} a={a} lang={lang} onEdit={() => { setEditing(a); setShowForm(true); }} />)}
                  </div>
                </div>
              )}

              {/* Regular */}
              <div>
                {pinned.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Megaphone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">{t("All Announcements", lang)}</span>
                  </div>
                )}
                <div className="space-y-3">
                  {regular.map(a => <AnnouncementCard key={a.id} a={a} lang={lang} onEdit={() => { setEditing(a); setShowForm(true); }} />)}
                </div>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>{t("No announcements yet", lang)}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === "messages" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t("Messages & Communication", lang)}</h2>
            <p className="text-sm text-slate-500">{contacts.length} {t("recipients", lang)}</p>
          </div>

          {/* Compose */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-500" /> {t("Compose New Message", lang)}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Channel toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setChannel("sms")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${channel === "sms" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}
                >
                  <Phone className="w-4 h-4" /> SMS
                </button>
                <button
                  onClick={() => setChannel("email")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${channel === "email" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
              </div>

              <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                <Users className="w-4 h-4 text-indigo-500" />
                <span className="text-sm text-indigo-700 font-medium">{t("Send to all", lang)} {contacts.length} {lang === "vi" ? "thành viên" : lang === "fr" ? "membres" : "recipients"}</span>
              </div>

              {channel === "email" && (
                <Input
                  placeholder={lang === "vi" ? "Tiêu đề email..." : lang === "fr" ? "Objet de l'email..." : "Email subject..."}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              )}

              <Textarea
                placeholder={channel === "sms" ? (lang === "vi" ? "Nội dung SMS (tối đa 160 ký tự)..." : lang === "fr" ? "Contenu SMS (max 160 car.)..." : "SMS content (max 160 chars)...") : (lang === "vi" ? "Nội dung email..." : lang === "fr" ? "Contenu de l'email..." : "Email content...")}
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={channel === "sms" ? 3 : 6}
                maxLength={channel === "sms" ? 160 : undefined}
              />

              {channel === "sms" && (
                <p className="text-xs text-slate-400">{body.length}/160 {lang === "vi" ? "ký tự" : lang === "fr" ? "caractères" : "characters"}</p>
              )}

              <Button
                className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                disabled={!body.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                {t("Send", lang)} {channel === "sms" ? "SMS" : "Email"} ({contacts.length} {lang === "vi" ? "thành viên" : lang === "fr" ? "membres" : "recipients"})
              </Button>
            </CardContent>
          </Card>

          {/* Sent history */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">{t("Message History", lang)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SENT_MESSAGES.map(msg => (
                  <div key={msg.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.type === "email" ? "bg-sky-50" : "bg-violet-50"}`}>
                      {msg.type === "email"
                        ? <Mail className="w-4 h-4 text-sky-500" />
                        : <Phone className="w-4 h-4 text-violet-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{msg.subject[lang] || msg.subject.en}</p>
                      <p className="text-xs text-slate-400">{msg.date} · {msg.sent_to} {t("recipients", lang)}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">{t("Sent", lang)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showForm && (
        <AnnouncementForm
          open={showForm}
          onOpenChange={setShowForm}
          announcement={editing}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ["announcements"] }); }}
        />
      )}
    </div>
  );
}

function AnnouncementCard({ a, lang, onEdit }) {
  const CHANNEL_COLORS = {
    internal: "bg-slate-100 text-slate-600",
    email: "bg-blue-100 text-blue-700",
    sms: "bg-green-100 text-green-700",
    whatsapp: "bg-emerald-100 text-emerald-700",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {a.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            <h4 className="font-semibold text-slate-800">{a.title}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${CHANNEL_COLORS[a.channel] || CHANNEL_COLORS.internal}`}>{a.channel}</span>
          </div>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{a.content}</p>
          <div className="flex gap-3 mt-2 text-xs text-slate-400">
            {a.published_date && <span>📅 {a.published_date}</span>}
            {a.target && <span>🎯 {a.target}</span>}
          </div>
        </div>
        <button onClick={onEdit} className="text-xs text-slate-400 hover:text-violet-600 shrink-0">{t("Edit", lang)}</button>
      </div>
    </div>
  );
}