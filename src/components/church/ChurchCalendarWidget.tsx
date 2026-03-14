import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfDay,
} from "date-fns";
import { vi, fr, enUS } from "date-fns/locale";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";

const EVENT_COLORS = {
  meeting: "bg-indigo-500",
  call: "bg-emerald-500",
  email: "bg-sky-500",
  task: "bg-amber-500",
  note: "bg-slate-400",
};

const EVENT_LABELS = {
  en: { meeting: "Service", call: "Group", email: "Email", task: "Task", note: "Note" },
  vi: { meeting: "Phụng vụ", call: "Nhóm", email: "Email", task: "Nhiệm vụ", note: "Ghi chú" },
};

const DAY_HEADERS = {
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  vi: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
};

function buildGoogleCalendarUrl(event: any) {
  const title = encodeURIComponent(event.subject || "Sự kiện");
  const details = encodeURIComponent(event.description || "");
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  if (event.due_date) {
    const d = new Date(event.due_date);
    const dateStr = format(d, "yyyyMMdd");
    return `${base}&text=${title}&details=${details}&dates=${dateStr}/${dateStr}`;
  }
  return `${base}&text=${title}&details=${details}`;
}

export default function ChurchCalendarWidget({ events = [] }: { events: any[] }) {
  const { lang } = useLang();
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState("month"); // "month" | "week"
  const [selected, setSelected] = useState<Date | null>(null);
  const dateLocale = lang === "vi" ? vi : enUS;
  const labels = EVENT_LABELS[lang] || EVENT_LABELS.en;
  const dayHeaders = DAY_HEADERS[lang] || DAY_HEADERS.en;

  const weekStart = startOfWeek(current, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(current, { weekStartsOn: 1 });

  const days =
    view === "month"
      ? eachDayOfInterval({
        start: startOfWeek(startOfMonth(current), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(current), { weekStartsOn: 1 }),
      })
      : eachDayOfInterval({ start: weekStart, end: weekEnd });

  const prev = () =>
    view === "month" ? setCurrent(subMonths(current, 1)) : setCurrent(subWeeks(current, 1));
  const next = () =>
    view === "month" ? setCurrent(addMonths(current, 1)) : setCurrent(addWeeks(current, 1));

  const eventsOnDay = (day: Date) =>
    events.filter((e: any) => e.due_date && isSameDay(new Date(e.due_date), day));

  const selectedDayEvents = selected ? eventsOnDay(selected) : [];

  const headerLabel =
    view === "month"
      ? format(current, "MMMM yyyy", { locale: dateLocale })
      : `${format(weekStart, "dd/MM")} – ${format(weekEnd, "dd/MM/yyyy")}`;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            {lang === "vi" ? "Lịch Hội Thánh" : "Church Calendar"}
          </CardTitle>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView("month")}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${view === "month" ? "bg-indigo-100 text-indigo-700 font-medium" : "text-slate-400 hover:text-slate-700"}`}
            >
              {lang === "vi" ? "Tháng" : "Month"}
            </button>
            <button
              onClick={() => setView("week")}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${view === "week" ? "bg-indigo-100 text-indigo-700 font-medium" : "text-slate-400 hover:text-slate-700"}`}
            >
              {lang === "vi" ? "Tuần" : "Week"}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prev} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700 capitalize">{headerLabel}</span>
          <button onClick={next} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-1">
          {dayHeaders.map((d) => (
            <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const dayEvents = eventsOnDay(day);
            const isSelected = selected ? isSameDay(day, selected) : false;
            const inMonth = isSameMonth(day, current);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelected((selected && isSameDay(day, selected)) ? null : day)}
                className={`
                  relative flex flex-col items-center rounded-lg py-1 text-xs transition-colors
                  ${isSelected ? "bg-indigo-600 text-white" : isToday(day) ? "bg-indigo-50 text-indigo-700 font-bold" : inMonth ? "hover:bg-slate-100 text-slate-700" : "text-slate-300"}
                `}
              >
                <span className="font-medium">{format(day, "d")}</span>
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-full px-0.5">
                  {dayEvents.slice(0, 3).map((e: any, i: number) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : EVENT_COLORS[e.type as keyof typeof EVENT_COLORS] || "bg-slate-400"}`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected day events */}
        {selected && (
          <div className="mt-4 border-t pt-3 space-y-2">
            <p className="text-xs font-semibold text-slate-600">
              {selected && format(selected, "EEEE, dd/MM/yyyy", { locale: dateLocale })}
            </p>
            {selectedDayEvents.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">
                {t("No events", lang)}
              </p>
            ) : (
              selectedDayEvents.map((ev: any) => (
                <div key={ev.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${EVENT_COLORS[ev.type as keyof typeof EVENT_COLORS] || "bg-slate-400"}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{ev.subject}</p>
                      {ev.description && (
                        <p className="text-xs text-slate-400 truncate">{ev.description}</p>
                      )}
                    </div>
                  </div>
                  <a
                    href={buildGoogleCalendarUrl(ev)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
                    title={t("Add to Google Calendar", lang)}
                  >
                    <ExternalLink className="w-3 h-3" />
                    GCal
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3 border-t pt-2">
          {Object.entries(labels).slice(0, 3).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${EVENT_COLORS[key as keyof typeof EVENT_COLORS]}`} />
              <span className="text-xs text-slate-400">{label as string}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}