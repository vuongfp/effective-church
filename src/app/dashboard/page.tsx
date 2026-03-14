"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Calendar, Music, HandHeart, BookOpen, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceChart from "@/components/church/AttendanceChart";
import DashboardOfferingChart from "@/components/church/DashboardOfferingChart";
import DashboardTasksWidget from "@/components/church/DashboardTasksWidget";
import ChurchCalendarWidget from "@/components/church/ChurchCalendarWidget";
import DashboardMemberStats from "@/components/church/DashboardMemberStats";
import BirthdayNotifications from "@/components/church/BirthdayNotifications";
import { useLang } from "@/components/i18n/LanguageContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const MONTH_LABELS: Record<string, string[]> = {
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    vi: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
};

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: "indigo" | "violet" | "emerald" | "amber" | "rose" | "sky";
    sub?: string;
}

function StatCard({ label, value, icon: Icon, color, sub }: StatCardProps) {
    const colors: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600",
        violet: "bg-violet-50 text-violet-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        rose: "bg-rose-50 text-rose-600",
        sky: "bg-sky-50 text-sky-600",
    };
    return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
                        <p className="text-2xl font-bold text-slate-900">{value}</p>
                        {sub && <p className="text-xs text-emerald-600 mt-1">{sub}</p>}
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function VisitorChart({ visitors, lang }: { visitors: any[]; lang: string }) {
    const months = MONTH_LABELS[lang] || MONTH_LABELS.en;
    const currentYear = new Date().getFullYear();
    const monthlyData = months.map((label, i) => {
        const newCount = visitors.filter(v => {
            const d = new Date(v.first_visit_date);
            return d.getFullYear() === currentYear && d.getMonth() === i;
        }).length;
        const returning = visitors.filter(v => {
            const d = new Date(v.last_visit_date || v.first_visit_date);
            return d.getFullYear() === currentYear && d.getMonth() === i && v.status === "returning";
        }).length;
        return { label, new: newCount, returning };
    });

    const newLabel = lang === "vi" ? "Khách mới" : "New Visitors";
    const returningLabel = lang === "vi" ? "Trở lại" : "Returning";
    const title = lang === "vi" ? "Khách thăm" : "Visitors";

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-500" /> {title} {currentYear}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData} barSize={14} barGap={4}>
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }} />
                        <Bar dataKey="new" name={newLabel} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="returning" name={returningLabel} fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-6 justify-center text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-400 inline-block" /> {newLabel}</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> {returningLabel}</span>
                </div>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const { lang } = useLang();
    const supabase = createClient();
    const currentYear = new Date().getFullYear();

    const [members, setMembers] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [visitors, setVisitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [
                { data: m }, { data: g }, { data: a }, { data: ar }, { data: t }, { data: v }
            ] = await Promise.all([
                supabase.from("members").select("*"),
                supabase.from("groups").select("*"),
                supabase.from("activities").select("*").order("due_date", { ascending: true }).limit(50),
                supabase.from("attendance_records").select("*").order("date", { ascending: false }).limit(500),
                supabase.from("tasks").select("*"),
                supabase.from("visitors").select("*").order("first_visit_date", { ascending: false }).limit(500),
            ]);
            setMembers(m || []);
            setGroups(g || []);
            setActivities(a || []);
            setAttendanceRecords(ar || []);
            setTasks(t || []);
            setVisitors(v || []);
            setLoading(false);
        }
        fetchData();
    }, []);

    const thisYearRecords = attendanceRecords.filter(r => r.attendance && new Date(r.date).getFullYear() === currentYear);
    const avgAttendance = thisYearRecords.length > 0
        ? Math.round(thisYearRecords.reduce((s, r) => s + r.attendance, 0) / thisYearRecords.length)
        : 0;
    const totalTitheThisYear = thisYearRecords.reduce((s, r) => s + (r.tithe_cad || 0), 0);
    const upcomingEvents = activities.filter(a => a.type === "meeting" && !a.completed);

    const welcomeText = lang === "vi" ? "Chào mừng đến ChurchCRM" : "Welcome to EffectiveCRM";
    const subText = lang === "vi"
        ? "Quản lý hội thánh của bạn một cách hiệu quả và ân hậu."
        : "Manage your church effectively and gracefully.";

    const L = {
        totalMembers: lang === "vi" ? "Tổng thành viên" : "Total Members",
        groups: lang === "vi" ? "Nhóm / Tế bào" : "Groups",
        upcomingEvents: lang === "vi" ? "Sự kiện sắp tới" : "Upcoming Events",
        avgAttendance: lang === "vi" ? "TB Điểm danh/tuần" : "Avg Attendance/wk",
        tithe: lang === "vi" ? "Dâng hiến" : "Tithes",
        visitors: lang === "vi" ? "Khách thăm" : "Visitors",
        calendar: lang === "vi" ? "Lịch Hội Thánh" : "Church Calendar",
        noEvents: lang === "vi" ? "Chưa có sự kiện nào" : "No upcoming events",
        year: lang === "vi" ? "Năm" : "Year",
    };

    return (
        <div className="p-4 lg:p-8 space-y-8">
            {/* Birthday & Care Notifications */}
            <BirthdayNotifications />

            {/* Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">{welcomeText}</h2>
                    <p className="text-sm text-white/80">{subText}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard label={L.totalMembers} value={members.length} icon={Users} color="indigo" />
                <StatCard label={L.groups} value={groups.length} icon={Users} color="violet" />
                <StatCard label={L.upcomingEvents} value={upcomingEvents.length} icon={Calendar} color="emerald" />
                <StatCard
                    label={L.avgAttendance}
                    value={loading ? "—" : (avgAttendance || "—")}
                    icon={Music}
                    color="amber"
                    sub={`${L.year} ${currentYear}`}
                />
                <StatCard label={L.visitors} value={visitors.length} icon={UserCheck} color="rose" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceChart records={attendanceRecords} year={currentYear} compact />
                <VisitorChart visitors={visitors} lang={lang} />
            </div>

            {/* Member breakdown stats */}
            <DashboardMemberStats contacts={members} />

            {/* Calendar & Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChurchCalendarWidget events={activities} />

                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-500" /> {L.upcomingEvents}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingEvents.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">{L.noEvents}</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingEvents.slice(0, 6).map((e: any) => (
                                    <div key={e.id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">{e.subject}</p>
                                            {e.due_date && (
                                                <p className="text-xs text-slate-400">
                                                    {new Date(e.due_date).toLocaleDateString(
                                                        lang === "vi" ? "vi-VN" : "en-US"
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                        <a
                                            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.subject || "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium shrink-0"
                                        >
                                            + GCal
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Priority Tasks */}
            <DashboardTasksWidget tasks={tasks} />
        </div>
    );
}
