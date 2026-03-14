"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Calendar, Plus, Search, ChevronLeft, ChevronRight,
    CheckCircle2, Circle, MapPin, Users, Clock, Trash2,
    Save, Loader2, X, Pencil, LayoutList, CalendarDays,
    ChevronDown, ChevronUp, GripVertical, ImagePlus, ListOrdered, Palette
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────── */
interface AgendaItem {
    id: string;
    time?: string;
    title: string;
    speaker?: string;
    description?: string;
}

interface Activity {
    id: string;
    type?: string | null;
    subject?: string | null;
    due_date?: string | null;
    location?: string | null;
    event_category?: string | null;
    responsible_person?: string | null;
    expected_attendance?: number | null;
    completed?: boolean;
    notes?: string | null;
    agenda?: AgendaItem[] | null;
    cover_image_url?: string | null;
    background_color?: string | null;
}

/* ── Helpers ─────────────────────────────────────────────────── */
const EVENT_TYPES = ["event", "meeting", "service", "prayer", "outreach", "training", "task"];
const EVENT_CATEGORIES = ["Worship", "Youth", "Kids", "Men", "Women", "Outreach", "Prayer", "Training", "Admin", "Other"];

const TYPE_COLORS: Record<string, string> = {
    event: "bg-indigo-100 text-indigo-700",
    meeting: "bg-blue-100 text-blue-700",
    service: "bg-violet-100 text-violet-700",
    prayer: "bg-amber-100 text-amber-700",
    outreach: "bg-emerald-100 text-emerald-700",
    training: "bg-orange-100 text-orange-700",
    task: "bg-slate-100 text-slate-600",
};

const TYPE_DOT: Record<string, string> = {
    event: "bg-indigo-500",
    meeting: "bg-blue-500",
    service: "bg-violet-500",
    prayer: "bg-amber-500",
    outreach: "bg-emerald-500",
    training: "bg-orange-500",
    task: "bg-slate-400",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtDate(d: string | null | undefined) {
    if (!d) return "—";
    const [, m, day] = d.split("-");
    return `${day}/${m}`;
}
function fmtDateFull(d: string | null | undefined) {
    if (!d) return "—";
    const dt = new Date(d + "T12:00:00");
    return dt.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

/* ── Event Modal ─────────────────────────────────────────────── */
const BG_PRESETS = [
    "#ffffff", "#f8fafc", "#eff6ff", "#f5f3ff", "#fdf2f8",
    "#f0fdf4", "#fff7ed", "#fefce8", "#1e1b4b", "#0f172a",
];

function AgendaEditor({ items, onChange }: { items: AgendaItem[]; onChange: (items: AgendaItem[]) => void }) {
    const addItem = () => onChange([...items, { id: crypto.randomUUID(), title: "", time: "", speaker: "", description: "" }]);
    const updateItem = (id: string, k: keyof AgendaItem, v: string) =>
        onChange(items.map(it => it.id === id ? { ...it, [k]: v } : it));
    const removeItem = (id: string) => onChange(items.filter(it => it.id !== id));

    return (
        <div className="space-y-2">
            {items.map((item, idx) => (
                <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                        <span className="text-xs font-bold text-slate-400 w-5 shrink-0">#{idx + 1}</span>
                        <input value={item.time || ""} onChange={e => updateItem(item.id, "time", e.target.value)}
                            placeholder="Time (e.g. 9:00am)" className="w-28 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white shrink-0" />
                        <input value={item.title} onChange={e => updateItem(item.id, "title", e.target.value)}
                            placeholder="Agenda item title *" className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white" />
                        <button type="button" onClick={() => removeItem(item.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex gap-2 pl-9">
                        <input value={item.speaker || ""} onChange={e => updateItem(item.id, "speaker", e.target.value)}
                            placeholder="Speaker / Leader" className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white" />
                        <input value={item.description || ""} onChange={e => updateItem(item.id, "description", e.target.value)}
                            placeholder="Notes (optional)" className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white" />
                    </div>
                </div>
            ))}
            <button type="button" onClick={addItem}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors px-1">
                <Plus className="w-3.5 h-3.5" /> Add agenda item
            </button>
        </div>
    );
}

function EventModal({ activity, onClose, onSaved }: { activity: Partial<Activity> | null; onClose: () => void; onSaved: () => void }) {
    const supabase = createClient();
    const [form, setForm] = useState<Partial<Activity>>({});
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [advanced, setAdvanced] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activity?.id) {
            setForm({ ...activity });
            // Open advanced if advanced fields already have data
            if (activity.cover_image_url || activity.background_color || (activity.agenda && (activity.agenda as AgendaItem[]).length > 0)) {
                setAdvanced(true);
            }
        } else {
            setForm({ type: "event", due_date: todayStr(), completed: false, agenda: [] });
        }
    }, [activity]);

    const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

    const agenda = (form.agenda as AgendaItem[]) || [];

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        const ext = file.name.split(".").pop();
        const path = `events/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("event-images").upload(path, file, { upsert: true });
        if (error) { setErr(error.message); setUploading(false); return; }
        const { data } = supabase.storage.from("event-images").getPublicUrl(path);
        set("cover_image_url", data.publicUrl);
        setUploading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.subject?.trim()) return;
        setSaving(true); setErr(null);
        const payload = { ...form, agenda: agenda };
        let error;
        if (activity?.id) {
            ({ error } = await supabase.from("activities").update(payload).eq("id", activity.id));
        } else {
            const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
            ({ error } = await supabase.from("activities").insert([{ id, ...payload }]));
        }
        setSaving(false);
        if (error) { setErr(error.message); return; }
        onSaved(); onClose();
    };

    const bgStyle = form.background_color
        ? { background: form.background_color }
        : {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden" style={bgStyle}>
                {/* Cover image banner */}
                {form.cover_image_url && (
                    <div className="relative h-32 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                        <button onClick={() => set("cover_image_url", null)}
                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80 shrink-0">
                    <h2 className="text-lg font-bold text-slate-900">{activity?.id ? "Edit Event" : "New Event"}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {/* Subject */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title *</label>
                        <input value={form.subject || ""} onChange={e => set("subject", e.target.value)} required
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80" />
                    </div>
                    {/* Type */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</label>
                        <div className="flex flex-wrap gap-2">
                            {EVENT_TYPES.map(t => (
                                <button key={t} type="button" onClick={() => set("type", t)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.type === t ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500 hover:border-indigo-300 bg-white/70"}`}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Date + Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
                            <input type="date" value={form.due_date || ""} onChange={e => set("due_date", e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</label>
                            <select value={form.event_category || ""} onChange={e => set("event_category", e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80">
                                <option value="">— Select —</option>
                                {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* Location + Attendance */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</label>
                            <input value={form.location || ""} onChange={e => set("location", e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Expected Attendance</label>
                            <input type="number" min="0" value={form.expected_attendance ?? ""} onChange={e => set("expected_attendance", e.target.value ? parseInt(e.target.value) : null)}
                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80" />
                        </div>
                    </div>
                    {/* Responsible Person */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Responsible Person</label>
                        <input value={form.responsible_person || ""} onChange={e => set("responsible_person", e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80" />
                    </div>
                    {/* Notes */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</label>
                        <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white/80" />
                    </div>
                    {/* Completed toggle */}
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div onClick={() => set("completed", !form.completed)}
                            className={`w-11 h-6 rounded-full transition-colors ${form.completed ? "bg-emerald-500" : "bg-slate-200"} relative`}>
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.completed ? "translate-x-5" : ""}`} />
                        </div>
                        <span className="text-sm text-slate-600">Mark as completed</span>
                    </label>

                    {/* ── Advanced Options ────────────────────────────────── */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <button type="button" onClick={() => setAdvanced(v => !v)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700">
                            <span className="flex items-center gap-2">
                                ⚙️ Advanced Options
                                {(form.cover_image_url || form.background_color || agenda.length > 0) && (
                                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                                        {[form.cover_image_url ? "Cover" : "", form.background_color ? "BG" : "", agenda.length > 0 ? `${agenda.length} agenda` : ""].filter(Boolean).join(" · ")}
                                    </span>
                                )}
                            </span>
                            {advanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {advanced && (
                            <div className="px-4 py-4 space-y-5 border-t border-slate-200">
                                {/* Cover Image */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                        <ImagePlus className="w-3.5 h-3.5" /> Cover Image
                                    </label>
                                    {form.cover_image_url ? (
                                        <div className="relative rounded-xl overflow-hidden h-28 border border-slate-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={form.cover_image_url} alt="Cover preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => set("cover_image_url", null)}
                                                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors text-xs flex items-center gap-1">
                                                <X className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileRef.current?.click()}
                                            className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                                            {uploading ? (
                                                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                            ) : (
                                                <>
                                                    <ImagePlus className="w-5 h-5 text-slate-400" />
                                                    <p className="text-xs text-slate-400">Click to upload cover image (PNG, JPG, WebP — max 5MB)</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                                </div>

                                {/* Background Color */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                        <Palette className="w-3.5 h-3.5" /> Background Color
                                    </label>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {BG_PRESETS.map(color => (
                                            <button key={color} type="button" onClick={() => set("background_color", form.background_color === color ? null : color)}
                                                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${form.background_color === color ? "border-indigo-500 scale-110" : "border-slate-200"}`}
                                                style={{ background: color }}
                                                title={color} />
                                        ))}
                                        {/* Custom color input */}
                                        <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2 py-1 bg-white">
                                            <input type="color" value={form.background_color || "#ffffff"}
                                                onChange={e => set("background_color", e.target.value)}
                                                className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent" />
                                            <span className="text-xs text-slate-500 font-mono">{form.background_color || "Custom"}</span>
                                        </div>
                                        {form.background_color && (
                                            <button type="button" onClick={() => set("background_color", null)}
                                                className="text-xs text-slate-400 hover:text-red-500 transition-colors">Reset</button>
                                        )}
                                    </div>
                                </div>

                                {/* Agenda */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                        <ListOrdered className="w-3.5 h-3.5" /> Agenda
                                        {agenda.length > 0 && <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{agenda.length} items</span>}
                                    </label>
                                    <AgendaEditor items={agenda} onChange={v => set("agenda", v)} />
                                </div>
                            </div>
                        )}
                    </div>

                    {err && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
                </form>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100/80 bg-slate-50/60 rounded-b-2xl shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button onClick={handleSave as unknown as React.MouseEventHandler} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Saving…" : "Save Event"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Mini Calendar ───────────────────────────────────────────── */
function MiniCalendar({ month, activities, onDayClick, onMonthChange }: {
    month: Date;
    activities: Activity[];
    onDayClick: (d: string) => void;
    onMonthChange: (d: Date) => void;
}) {
    const today = todayStr();

    // Build grid: pad start-of-month with blanks
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const eventMap = useMemo(() => {
        const map: Record<string, Activity[]> = {};
        activities.forEach(a => {
            if (a.due_date) {
                map[a.due_date] = map[a.due_date] || [];
                map[a.due_date].push(a);
            }
        });
        return map;
    }, [activities]);

    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = (day: number) => `${month.getFullYear()}-${pad(month.getMonth() + 1)}-${pad(day)}`;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            {/* Nav */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1))}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-bold text-slate-900">
                    {month.toLocaleDateString("en-CA", { month: "long", year: "numeric" })}
                </h3>
                <button onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1))}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>)}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-0.5">
                {cells.map((day, i) => {
                    if (!day) return <div key={`blank-${i}`} />;
                    const ds = dateStr(day);
                    const evts = eventMap[ds] || [];
                    const isToday = ds === today;
                    return (
                        <button key={ds} onClick={() => onDayClick(ds)}
                            className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium relative transition-colors
                            ${isToday ? "bg-indigo-600 text-white" : "hover:bg-slate-100 text-slate-700"}`}>
                            {day}
                            {evts.length > 0 && (
                                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isToday ? "bg-white" : (TYPE_DOT[evts[0].type ?? "task"] ?? "bg-slate-400")}`} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Main Page ───────────────────────────────────────────────── */
type ViewMode = "list" | "calendar";

export default function EventsPage() {
    const supabase = createClient();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [modal, setModal] = useState<Partial<Activity> | null | undefined>(undefined);

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from("activities").select("*").order("due_date", { ascending: true });
        setActivities(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchActivities(); }, [fetchActivities]);

    const toggleComplete = async (a: Activity) => {
        await supabase.from("activities").update({ completed: !a.completed }).eq("id", a.id);
        fetchActivities();
    };

    const deleteActivity = async (id: string) => {
        if (!confirm("Delete this event?")) return;
        await supabase.from("activities").delete().eq("id", id);
        fetchActivities();
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return activities.filter(a => {
            const matchQ = !q || a.subject?.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q);
            const matchType = typeFilter === "all" || a.type === typeFilter;
            const matchDay = !selectedDay || a.due_date === selectedDay;
            return matchQ && matchType && matchDay;
        });
    }, [activities, search, typeFilter, selectedDay]);

    const stats = useMemo(() => ({
        total: activities.length,
        upcoming: activities.filter(a => !a.completed && a.due_date && a.due_date >= todayStr()).length,
        completed: activities.filter(a => a.completed).length,
        thisMonth: activities.filter(a => a.due_date?.startsWith(new Date().toISOString().slice(0, 7))).length,
    }), [activities]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Events & Activities</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{activities.length} total activities scheduled</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                        <button onClick={() => setViewMode("list")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
                            <LayoutList className="w-3.5 h-3.5" /> List
                        </button>
                        <button onClick={() => setViewMode("calendar")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "calendar" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
                            <CalendarDays className="w-3.5 h-3.5" /> Calendar
                        </button>
                    </div>
                    <button onClick={() => setModal({})}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> New Event
                    </button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: stats.total, color: "text-slate-900", bg: "bg-slate-50" },
                    { label: "Upcoming", value: stats.upcoming, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "This Month", value: stats.thisMonth, color: "text-violet-600", bg: "bg-violet-50" },
                    { label: "Completed", value: stats.completed, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl px-5 py-4 border border-slate-100`}>
                        <p className="text-xs font-medium text-slate-500">{label}</p>
                        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Calendar + List layout */}
            <div className={`flex gap-6 ${viewMode === "calendar" ? "flex-col lg:flex-row items-start" : "flex-col"}`}>
                {/* Calendar sidebar */}
                {viewMode === "calendar" && (
                    <div className="w-full lg:w-72 shrink-0 space-y-3">
                        <MiniCalendar
                            month={currentMonth}
                            activities={activities}
                            onDayClick={d => setSelectedDay(d === selectedDay ? null : d)}
                            onMonthChange={setCurrentMonth}
                        />
                        {selectedDay && (
                            <div className="text-xs text-slate-500 bg-slate-100 rounded-lg px-3 py-2 flex items-center justify-between">
                                <span>Showing: <strong className="text-slate-700">{fmtDateFull(selectedDay)}</strong></span>
                                <button onClick={() => setSelectedDay(null)} className="hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                            </div>
                        )}
                    </div>
                )}

                {/* List panel */}
                <div className="flex-1 space-y-4 min-w-0">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative max-w-xs flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {[{ key: "all", label: "All" }, ...EVENT_TYPES.map(t => ({ key: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))].map(({ key, label }) => (
                                <button key={key} onClick={() => setTypeFilter(key)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                                    ${typeFilter === key ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500 hover:border-indigo-300"}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Event list */}
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                            <Calendar className="w-12 h-12 opacity-30" />
                            <p className="text-sm font-medium">{search || typeFilter !== "all" ? "No events match your filters." : selectedDay ? `No events on ${fmtDateFull(selectedDay)}.` : "No events yet."}</p>
                            {!search && typeFilter === "all" && !selectedDay && (
                                <button onClick={() => setModal({})} className="text-sm text-indigo-600 hover:underline">Create the first event</button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(ev => (
                                <div key={ev.id} className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all flex items-start gap-4 p-4
                                    ${ev.completed ? "border-slate-100 opacity-70" : "border-slate-200"}`}>
                                    {/* Complete toggle */}
                                    <button onClick={() => toggleComplete(ev)} className="mt-0.5 shrink-0 transition-transform hover:scale-110">
                                        {ev.completed
                                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            : <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-400 transition-colors" />}
                                    </button>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <p className={`font-semibold text-sm ${ev.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                                                {ev.subject || "(no title)"}
                                            </p>
                                            {ev.type && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[ev.type] ?? "bg-slate-100 text-slate-500"}`}>
                                                    {ev.type}
                                                </span>
                                            )}
                                            {ev.event_category && (
                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500">{ev.event_category}</span>
                                            )}
                                            {ev.completed && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Done</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-1.5">
                                            {ev.due_date && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{fmtDateFull(ev.due_date)}</span>}
                                            {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ev.location}</span>}
                                            {ev.expected_attendance && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{ev.expected_attendance} expected</span>}
                                            {ev.responsible_person && <span className="flex items-center gap-1">👤 {ev.responsible_person}</span>}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => setModal(ev)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => deleteActivity(ev.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modal !== undefined && (
                <EventModal
                    activity={modal}
                    onClose={() => setModal(undefined)}
                    onSaved={fetchActivities}
                />
            )}
        </div>
    );
}
