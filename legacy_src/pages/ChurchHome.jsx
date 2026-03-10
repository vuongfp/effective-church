import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Church, Calendar, Megaphone, MapPin, Phone, Mail, Clock, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { LanguageProvider, useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";

function ChurchHomeInner() {
  const { lang } = useLang();
  const visitorName = localStorage.getItem("visitor_first_name");

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements_public"],
    queryFn: () => base44.entities.Announcement.list("-published_date", 5),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities_public"],
    queryFn: () => base44.entities.Activity.filter({ type: "meeting", completed: false }, "-due_date", 6),
  });

  const upcomingEvents = activities.filter(a => a.due_date && new Date(a.due_date) >= new Date());

  const serviceTimes = [
    { day: t("church_sunday", lang), time: "9:00 AM", label: t("church_main_service", lang) },
    { day: t("church_wednesday", lang), time: "7:00 PM", label: t("church_prayer_bible", lang) },
    { day: t("church_friday", lang), time: "7:00 PM", label: t("church_youth", lang) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b671e4668?w=1200&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative px-6 py-16 text-center text-white max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-5">
            <Church className="w-8 h-8 text-white" />
          </div>
          {visitorName && (
            <p className="text-blue-300 text-sm mb-2 font-medium">
              ✨ {lang === "fr" ? "Bienvenue" : lang === "vi" ? "Chào mừng" : "Welcome"}, {visitorName}!
            </p>
          )}
          <h1 className="text-3xl font-bold mb-3">{t("church_home_welcome", lang)}</h1>
          <p className="text-blue-200 text-sm leading-relaxed">{t("church_home_tagline", lang)}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-12 space-y-6">
        <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-300" />
              <h2 className="font-semibold text-white">{t("church_service_times", lang)}</h2>
            </div>
            <div className="space-y-3">
              {serviceTimes.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <div>
                    <p className="font-medium text-white text-sm">{s.label}</p>
                    <p className="text-blue-300 text-xs">{s.day}</p>
                  </div>
                  <Badge className="bg-blue-500/30 text-blue-200 border-0 text-xs">{s.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {upcomingEvents.length > 0 && (
          <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-emerald-300" />
                <h2 className="font-semibold text-white">{t("church_upcoming_events", lang)}</h2>
              </div>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-3 py-2 border-b border-white/10 last:border-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{event.subject}</p>
                      {event.due_date && <p className="text-blue-300 text-xs mt-0.5">{format(new Date(event.due_date), "MMMM d, yyyy")}</p>}
                      {event.location && (
                        <p className="text-blue-300 text-xs flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {announcements.length > 0 && (
          <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="w-5 h-5 text-amber-300" />
                <h2 className="font-semibold text-white">{t("church_announcements", lang)}</h2>
              </div>
              <div className="space-y-3">
                {announcements.map(a => (
                  <div key={a.id} className="py-2 border-b border-white/10 last:border-0">
                    <p className="font-medium text-white text-sm">{a.title}</p>
                    <p className="text-blue-200 text-xs mt-1 leading-relaxed line-clamp-3">{a.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-300" />
              <h2 className="font-semibold text-white">{t("church_contact_us", lang)}</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-blue-200">
                <MapPin className="w-4 h-4 shrink-0 text-blue-400" />
                <span>123 Church Street, Toronto, ON M5V 2T6</span>
              </div>
              <div className="flex items-center gap-3 text-blue-200">
                <Phone className="w-4 h-4 shrink-0 text-blue-400" />
                <span>(416) 555-0100</span>
              </div>
              <div className="flex items-center gap-3 text-blue-200">
                <Mail className="w-4 h-4 shrink-0 text-blue-400" />
                <span>info@ourchurch.ca</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-blue-400 text-xs pb-4">
          <Heart className="w-3 h-3 inline mr-1 text-rose-400" />
          {t("church_thank_you", lang)}
        </p>
      </div>
    </div>
  );
}

export default function ChurchHome() {
  return (
    <LanguageProvider>
      <ChurchHomeInner />
    </LanguageProvider>
  );
}