"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    UserPlus, Mail, Phone, Calendar, MessageSquare, Trash2,
    Search, Filter, X, ChevronUp, ChevronDown, ChevronsUpDown,
    Save, Loader2, CheckCircle2
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────── */
interface Visitor {
    id: string;
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
    first_visit_date?: string | null;
    last_visit_date?: string | null;
    visit_count?: number;
    status?: string | null;
    notes?: string | null;
}

/* ── Helpers ─────────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, string> = {
    first_time: "bg-blue-100 text-blue-700",
    returning: "bg-violet-100 text-violet-700",
    converted_member: "bg-emerald-100 text-emerald-700",
};
const STATUS_LABEL: Record<string, string> = {
    first_time: "First Time",
    returning: "Returning",
    converted_member: "Member",
};
const STATUSES = ["first_time", "returning", "converted_member"];
const DATE_FILTERS = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
];

function fmtDate(d: string | null | undefined) {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y.slice(2)}`;
}

function today() { return new Date().toISOString().slice(0, 10); }

function passesDateFilter(v: Visitor, filter: string): boolean {
    if (filter === "all") return true;
    const d = v.last_visit_date || v.first_visit_date;
    if (!d) return false;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const visit = new Date(d); visit.setHours(0, 0, 0, 0);
    if (filter === "today") return visit.getTime() === now.getTime();
    if (filter === "week") {
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
        return visit >= weekStart && visit <= now;
    }
    if (filter === "month") return visit.getMonth() === now.getMonth() && visit.getFullYear() === now.getFullYear();
    return true;
}

/* ── Visitor Edit/Create Modal ───────────────────────────────── */
function VisitorModal({ visitor, onClose, onSaved }: { visitor: Partial<Visitor> | null; onClose: () => void; onSaved: () => void }) {
    const supabase = createClient();
    const [form, setForm] = useState<Partial<Visitor>>({});
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (visitor?.id) setForm({ ...visitor });
        else setForm({ status: "first_time", first_visit_date: today(), visit_count: 1 });
    }, [visitor]);

    const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.first_name?.trim() || !form.last_name?.trim()) return;
        setSaving(true); setErr(null);
        let error;
        if (visitor?.id) {
            ({ error } = await supabase.from("visitors").update({ ...form }).eq("id", visitor.id));
        } else {
            const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
            ({ error } = await supabase.from("visitors").insert([{ id, ...form }]));
        }
        setSaving(false);
        if (error) { setErr(error.message); return; }
        onSaved(); onClose();
    };

    const inp = (key: string, type = "text", placeholder?: string) => (
        <input type={type} value={(form[key as keyof Visitor] as string) || ""} onChange={e => set(key, e.target.value)}
            placeholder={placeholder}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white w-full" />
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <h2 className="text-lg font-bold text-slate-900">{visitor?.id ? "Edit Visitor" : "Add New Visitor"}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">First Name *</label>{inp("first_name")}</div>
                        <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Name *</label>{inp("last_name")}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>{inp("email", "email")}</div>
                        <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</label>{inp("phone", "tel")}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">First Visit Date</label>{inp("first_visit_date", "date")}</div>
                        <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Visit Date</label>{inp("last_visit_date", "date")}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                        <div className="flex gap-2 flex-wrap">
                            {STATUSES.map(s => (
                                <button key={s} type="button" onClick={() => set("status", s)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.status === s ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-500 hover:border-violet-300"}`}>
                                    {STATUS_LABEL[s]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</label>
                        <textarea value={(form.notes as string) || ""} onChange={e => set("notes", e.target.value)} rows={3}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none bg-white" />
                    </div>
                    {err && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
                </form>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button onClick={handleSave as unknown as React.MouseEventHandler} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ───────────────────────────────────────────────── */
type SortField = "name" | "first_visit" | "last_visit" | "visits";
type SortDir = "asc" | "desc";

export default function VisitorsPage() {
    const supabase = createClient();
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [sortField, setSortField] = useState<SortField>("first_visit");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [modalVisitor, setModalVisitor] = useState<Partial<Visitor> | null | undefined>(undefined);

    const fetchVisitors = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from("visitors").select("*").order("first_visit_date", { ascending: false });
        setVisitors(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchVisitors(); }, [fetchVisitors]);

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortField(field); setSortDir("desc"); }
    };

    const recordVisit = async (v: Visitor) => {
        const t = today();
        const isNew = v.last_visit_date !== t;
        await supabase.from("visitors").update({
            status: v.status === "first_time" ? "returning" : v.status,
            last_visit_date: t,
            visit_count: (v.visit_count || 1) + (isNew ? 1 : 0),
        }).eq("id", v.id);
        fetchVisitors();
    };

    const deleteVisitor = async (id: string) => {
        if (!confirm("Delete this visitor?")) return;
        await supabase.from("visitors").delete().eq("id", id);
        fetchVisitors();
    };

    const convertToMember = async (v: Visitor) => {
        if (!confirm(`Convert ${v.first_name} ${v.last_name} to member status?`)) return;
        await supabase.from("visitors").update({ status: "converted_member" }).eq("id", v.id);
        fetchVisitors();
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return visitors
            .filter(v => {
                const nameMatch = !q || `${v.first_name} ${v.last_name} ${v.email || ""}`.toLowerCase().includes(q);
                const statusMatch = statusFilter === "all" || v.status === statusFilter;
                return nameMatch && statusMatch && passesDateFilter(v, dateFilter);
            })
            .sort((a, b) => {
                let av: string | number = "", bv: string | number = "";
                if (sortField === "name") { av = `${a.last_name} ${a.first_name}`; bv = `${b.last_name} ${b.first_name}`; }
                else if (sortField === "first_visit") { av = a.first_visit_date || ""; bv = b.first_visit_date || ""; }
                else if (sortField === "last_visit") { av = a.last_visit_date || ""; bv = b.last_visit_date || ""; }
                else if (sortField === "visits") { av = a.visit_count ?? 0; bv = b.visit_count ?? 0; }
                if (typeof av === "number") return sortDir === "asc" ? av - (bv as number) : (bv as number) - av;
                return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
            });
    }, [visitors, search, statusFilter, dateFilter, sortField, sortDir]);

    const stats = useMemo(() => ({
        total: visitors.length,
        firstTime: visitors.filter(v => v.status === "first_time").length,
        returning: visitors.filter(v => v.status === "returning").length,
        converted: visitors.filter(v => v.status === "converted_member").length,
    }), [visitors]);

    const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
        <button onClick={() => handleSort(field)}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors group cursor-pointer select-none">
            {label}
            {sortField === field
                ? sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-violet-500" /> : <ChevronDown className="w-3.5 h-3.5 text-violet-500" />
                : <ChevronsUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Visitor Tracking</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and follow up with church visitors</p>
                </div>
                <button onClick={() => setModalVisitor({})}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <UserPlus className="w-4 h-4" /> Add Visitor
                </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Visitors", value: stats.total, color: "text-slate-900", bg: "bg-slate-50" },
                    { label: "First Time", value: stats.firstTime, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Returning", value: stats.returning, color: "text-violet-600", bg: "bg-violet-50" },
                    { label: "Became Members", value: stats.converted, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl px-5 py-4 border border-slate-100`}>
                        <p className="text-xs font-medium text-slate-500">{label}</p>
                        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Search + Filters */}
            <div className="space-y-3">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search visitors…"
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Status filter */}
                    <div className="flex items-center gap-2 text-xs">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-500 font-medium">Status:</span>
                        {[{ key: "all", label: "All" }, ...STATUSES.map(s => ({ key: s, label: STATUS_LABEL[s] }))].map(({ key, label }) => (
                            <button key={key} onClick={() => setStatusFilter(key)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                                ${statusFilter === key ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-500 hover:border-violet-300"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    {/* Date filter */}
                    <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-500 font-medium">Last Visit:</span>
                        {DATE_FILTERS.map(({ key, label }) => (
                            <button key={key} onClick={() => setDateFilter(key)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                                ${dateFilter === key ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-500 hover:border-violet-300"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    {(statusFilter !== "all" || dateFilter !== "all") && (
                        <button onClick={() => { setStatusFilter("all"); setDateFilter("all"); }}
                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                            <X className="w-3.5 h-3.5" /> Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b text-slate-500 font-medium text-xs uppercase tracking-wide">
                        <tr>
                            <th className="px-6 py-3"><SortBtn field="name" label="Name" /></th>
                            <th className="px-6 py-3">Contact</th>
                            <th className="px-6 py-3"><SortBtn field="first_visit" label="First Visit" /></th>
                            <th className="px-6 py-3"><SortBtn field="last_visit" label="Last Visit" /></th>
                            <th className="px-6 py-3"><SortBtn field="visits" label="Visits" /></th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400">Loading…</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                                {search || statusFilter !== "all" || dateFilter !== "all" ? "No visitors match your filters." : "No visitors yet — add the first one!"}
                            </td></tr>
                        ) : filtered.map(v => (
                            <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                    <button onClick={() => setModalVisitor(v)}
                                        className="text-violet-700 hover:text-violet-900 hover:underline font-medium text-left transition-colors">
                                        {v.last_name}, {v.first_name}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    <div className="flex flex-col gap-0.5 text-xs">
                                        {v.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{v.email}</span>}
                                        {v.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{v.phone}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 tabular-nums">{fmtDate(v.first_visit_date)}</td>
                                <td className="px-6 py-4 text-slate-500 tabular-nums">{fmtDate(v.last_visit_date)}</td>
                                <td className="px-6 py-4 text-slate-600 font-semibold tabular-nums text-center">{v.visit_count ?? 1}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[v.status || "first_time"] ?? "bg-slate-100 text-slate-500"}`}>
                                        {STATUS_LABEL[v.status || "first_time"] ?? v.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-1">
                                        {v.status !== "converted_member" && (
                                            <>
                                                <button onClick={() => recordVisit(v)} title="Record visit today"
                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:bg-violet-50 hover:text-violet-600 border border-slate-200 hover:border-violet-300 transition-colors">
                                                    <MessageSquare className="w-3.5 h-3.5" /> Visit
                                                </button>
                                                <button onClick={() => convertToMember(v)} title="Mark as member"
                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 hover:border-emerald-300 transition-colors">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => deleteVisitor(v.id)} title="Delete"
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && <p className="text-xs text-slate-400 px-6 py-3 border-t border-slate-100">{filtered.length} of {visitors.length} visitors shown</p>}
            </div>

            {/* Modal */}
            {modalVisitor !== undefined && (
                <VisitorModal
                    visitor={modalVisitor}
                    onClose={() => setModalVisitor(undefined)}
                    onSaved={fetchVisitors}
                />
            )}
        </div>
    );
}
