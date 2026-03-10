import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Search, Clock, CheckCircle, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ActivityForm from "../components/activities/ActivityForm";
import EmptyState from "../components/shared/EmptyState";
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

export default function ChurchEvents() {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-created_date"),
  });

  const toggle = async (ev) => {
    await base44.entities.Activity.update(ev.id, { completed: !ev.completed });
    queryClient.invalidateQueries({ queryKey: ["activities"] });
  };

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const activitiesByDate = useMemo(() => {
    const map = new Map();
    activities.forEach(a => {
      if (a.due_date) {
        const dateKey = a.due_date;
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey).push(a);
      }
    });
    return map;
  }, [activities]);

  const getActivitiesForDate = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return activitiesByDate.get(dateStr) || [];
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t("Events & Activities", lang)}</h2>
          <p className="text-sm text-slate-500">{activities.length} {t("activities", lang)}</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> {t("New Event", lang)}
        </Button>
      </div>

      {/* Calendar View */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h3 className="text-lg font-semibold text-slate-900">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {[lang === "vi" ? "CN" : lang === "fr" ? "Dim" : "Sun", lang === "vi" ? "T2" : lang === "fr" ? "Lun" : "Mon", lang === "vi" ? "T3" : lang === "fr" ? "Mar" : "Tue", lang === "vi" ? "T4" : lang === "fr" ? "Mer" : "Wed", lang === "vi" ? "T5" : lang === "fr" ? "Jeu" : "Thu", lang === "vi" ? "T6" : lang === "fr" ? "Ven" : "Fri", lang === "vi" ? "T7" : lang === "fr" ? "Sam" : "Sat"].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map(day => {
              const dayActivities = getActivitiesForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              return (
                <div
                   key={day.toString()}
                   className={`min-h-20 p-1.5 rounded-lg border ${
                     isCurrentMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"
                   } ${isTodayDate ? "ring-2 ring-indigo-500 bg-indigo-50" : ""}`}
                 >
                   <div className={`text-xs font-semibold mb-1 ${isTodayDate ? "text-indigo-700" : isCurrentMonth ? "text-slate-900" : "text-slate-400"}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayActivities.slice(0, 2).map(a => (
                      <div
                        key={a.id}
                        onClick={() => { setEditing(a); setShowForm(true); }}
                        className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded truncate cursor-pointer hover:bg-indigo-100 transition-colors"
                        title={a.subject}
                      >
                        {a.subject}
                      </div>
                    ))}
                    {dayActivities.length > 2 && (
                       <div className="text-xs text-slate-500 px-1.5">
                         +{dayActivities.length - 2} {lang === "vi" ? "hơn" : lang === "fr" ? "plus" : "more"}
                       </div>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and List */}
      <div>
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t("Search activities...", lang)} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <EmptyState icon={Calendar} title={t("No activities yet", lang)} description={lang === "vi" ? "Tạo hoạt động để bắt đầu" : lang === "fr" ? "Créer une activité pour commencer" : "Create an activity to get started"} actionLabel={t("New Event", lang)} onAction={() => { setEditing(null); setShowForm(true); }} />
        ) : (
          <div className="space-y-3">
            {activities
              .filter(a =>
                a.subject?.toLowerCase().includes(search.toLowerCase()) ||
                a.description?.toLowerCase().includes(search.toLowerCase())
              )
              .map(ev => (
                <Card key={ev.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-start gap-4">
                    <button onClick={() => toggle(ev)} className="mt-0.5 shrink-0">
                      {ev.completed
                        ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                        : <Circle className="w-5 h-5 text-slate-300" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold text-sm ${ev.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                          {ev.subject}
                        </p>
                        {ev.completed && <Badge className="bg-emerald-100 text-emerald-700 text-xs">{t("Completed", lang)}</Badge>}
                      </div>
                      {ev.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ev.description}</p>}
                      {ev.contact_name && <p className="text-xs text-indigo-500 mt-1">👤 {ev.contact_name}</p>}
                    </div>
                    {ev.due_date && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(ev.due_date), "dd/MM/yyyy")}
                      </div>
                    )}
                    <button
                      onClick={() => { setEditing(ev); setShowForm(true); }}
                      className="text-xs text-slate-400 hover:text-indigo-600 shrink-0"
                    >
                      {t("Edit", lang)}
                    </button>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {showForm && (
        <ActivityForm
          activity={editing}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ["activities"] }); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}