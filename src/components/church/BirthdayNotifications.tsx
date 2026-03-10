"use client";
import React, { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Gift, ChevronDown, ChevronUp, X, Heart } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import { useLang } from "../i18n/LanguageContext";
import Link from "next/link";

function getNextBirthday(birthdayStr: string | null | undefined) {
  if (!birthdayStr) return null;
  const today = new Date();
  const bday = parseISO(birthdayStr);
  const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1);
  return { date: thisYear, daysUntil: differenceInDays(thisYear, today) };
}

function getNextAnniversary(memberSinceStr: string | null | undefined) {
  if (!memberSinceStr) return null;
  const today = new Date();
  const since = parseISO(memberSinceStr);
  const years = today.getFullYear() - since.getFullYear();
  const nextAnniv = new Date(today.getFullYear(), since.getMonth(), since.getDate());
  if (nextAnniv < today) {
    nextAnniv.setFullYear(today.getFullYear() + 1);
    return { date: nextAnniv, daysUntil: differenceInDays(nextAnniv, today), years: years + 1 };
  }
  return { date: nextAnniv, daysUntil: differenceInDays(nextAnniv, today), years };
}

export default function BirthdayNotifications() {
  const { lang } = useLang();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const supabase = createClient();
  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from('members').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const notifications = useMemo(() => {
    const items: Array<{ id: string; contactId: string; name: string; type: string; daysUntil: number; date: Date; years?: number }> = [];
    const WINDOW = 14; // days ahead
    contacts.forEach(c => {
      const bd = getNextBirthday(c.birthday);
      if (bd && bd.daysUntil <= WINDOW) {
        items.push({
          id: `bd-${c.id}`,
          contactId: c.id,
          name: `${c.first_name} ${c.last_name}`,
          type: "birthday",
          daysUntil: bd.daysUntil,
          date: bd.date,
        });
      }
      const anniv = getNextAnniversary(c.member_since);
      if (anniv && anniv.daysUntil <= WINDOW && anniv.years > 0) {
        items.push({
          id: `anniv-${c.id}`,
          contactId: c.id,
          name: `${c.first_name} ${c.last_name}`,
          type: "anniversary",
          daysUntil: anniv.daysUntil,
          years: anniv.years,
          date: anniv.date,
        });
      }
    });
    return items.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [contacts]);

  if (notifications.length === 0 || dismissed) return null;

  const today = notifications.filter(n => n.daysUntil === 0);
  const upcoming = notifications.filter(n => n.daysUntil > 0);
  const visibleItems = expanded ? notifications : notifications.slice(0, 3);

  const labelBirthday = { en: "Birthday", vi: "Sinh nhật", fr: "Anniversaire" }[lang] || "Birthday";
  const labelAnniversary = { en: "Church Anniversary", vi: "Kỷ niệm gia nhập", fr: "Anniversaire d'église" }[lang] || "Church Anniversary";
  const labelToday = { en: "Today!", vi: "Hôm nay!", fr: "Aujourd'hui!" }[lang];
  const labelDays = (n: number) => n === 1
    ? ({ en: "Tomorrow", vi: "Ngày mai", fr: "Demain" }[lang])
    : `${n} ${({ en: "days", vi: "ngày nữa", fr: "jours" }[lang])}`;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4 relative">
      <button onClick={() => setDismissed(true)} className="absolute top-3 right-3 text-amber-400 hover:text-amber-600">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-5 h-5 text-amber-500" />
        <span className="font-semibold text-amber-800 text-sm">
          {lang === "vi" ? "Nhắc nhở sắp tới" : lang === "fr" ? "Rappels à venir" : "Upcoming Reminders"}
        </span>
        <span className="ml-1 bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">{notifications.length}</span>
      </div>
      <div className="space-y-2">
        {visibleItems.map(n => (
          <Link
            key={n.id}
            href={`/members/${n.contactId}`}
            className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${n.type === "birthday" ? "bg-rose-100" : "bg-violet-100"}`}>
              {n.type === "birthday" ? <Gift className="w-4 h-4 text-rose-500" /> : <Heart className="w-4 h-4 text-violet-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 group-hover:text-violet-600 transition-colors">{n.name}</p>
              <p className="text-xs text-slate-400">
                {n.type === "birthday" ? labelBirthday : `${labelAnniversary}${n.years ? ` (${n.years}y)` : ""}`}
                {" · "}{format(n.date, "MMM d")}
              </p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${n.daysUntil === 0 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-700"}`}>
              {n.daysUntil === 0 ? labelToday : labelDays(n.daysUntil)}
            </span>
          </Link>

        ))}
      </div>
      {notifications.length > 3 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-2 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded
            ? (lang === "vi" ? "Thu gọn" : lang === "fr" ? "Réduire" : "Show less")
            : `+${notifications.length - 3} ${lang === "vi" ? "thêm" : lang === "fr" ? "de plus" : "more"}`
          }
        </button>
      )}
    </div>
  );
}