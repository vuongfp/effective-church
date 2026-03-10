"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Map, Plus, Trash2, Search, ChevronUp, ChevronDown, ChevronsUpDown, LayoutList } from "lucide-react";
import dynamic from "next/dynamic";
import MemberEditModal from "@/components/church/MemberEditModal";
import GroupsTab from "@/components/church/GroupsTab";

// Dynamically import the map to avoid SSR issues with Leaflet
const MemberMapView = dynamic(
    () => import("@/components/church/MemberMapView"),
    { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-slate-400">Loading map...</div> }
);

type Tab = "list" | "map" | "groups";
type SortField = "name" | "email" | "phone" | "status" | "age";
type SortDir = "asc" | "desc";

function calcAge(birthday: string | null | undefined): number | null {
    if (!birthday) return null;
    const parts = birthday.split("-").map(Number);
    if (parts.length < 3) return null;
    const [bYear, bMonth, bDay] = parts; // 1-indexed month
    const today = new Date();
    const tYear = today.getFullYear();
    const tMonth = today.getMonth() + 1; // convert to 1-indexed
    const tDay = today.getDate();
    let age = tYear - bYear;
    if (tMonth < bMonth || (tMonth === bMonth && tDay < bDay)) age--;
    return age;
}

export default function MembersPage() {
    const supabase = createClient();
    const [tab, setTab] = useState<Tab>("list");
    const [members, setMembers] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    // Add member form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editMember, setEditMember] = useState<any | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [{ data: m }, { data: g }] = await Promise.all([
            supabase.from("members").select("*").order("last_name", { ascending: true }),
            supabase.from("groups").select("*"),
        ]);
        setMembers(m || []);
        setGroups(g || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const addMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) return;
        setAdding(true);
        const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        const { error } = await supabase.from("members").insert([{
            id, first_name: firstName.trim(), last_name: lastName.trim(),
            email: email.trim() || null, status: "active",
        }]);
        if (!error) {
            setFirstName(""); setLastName(""); setEmail("");
            setShowForm(false);
            await fetchData();
        }
        setAdding(false);
    };

    const deleteMember = async (id: string) => {
        if (!confirm("Delete this member?")) return;
        await supabase.from("members").delete().eq("id", id);
        await fetchData();
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortField(field); setSortDir("asc"); }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        const list = members.filter(m =>
            !q ||
            m.first_name?.toLowerCase().includes(q) ||
            m.last_name?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q) ||
            m.phone?.includes(q)
        );

        return [...list].sort((a, b) => {
            if (sortField === "age") {
                const av = calcAge(a.birthday) ?? -1;
                const bv = calcAge(b.birthday) ?? -1;
                return sortDir === "asc" ? av - bv : bv - av;
            }
            let av = "", bv = "";
            if (sortField === "name") { av = `${a.last_name} ${a.first_name}`; bv = `${b.last_name} ${b.first_name}`; }
            else if (sortField === "email") { av = a.email || ""; bv = b.email || ""; }
            else if (sortField === "phone") { av = a.phone || ""; bv = b.phone || ""; }
            else if (sortField === "status") { av = a.status || ""; bv = b.status || ""; }
            return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });
    }, [members, search, sortField, sortDir]);

    const TABS = [
        { id: "list" as Tab, label: "Members List", icon: Users },
        { id: "groups" as Tab, label: "Groups", icon: LayoutList },
        { id: "map" as Tab, label: "Map View", icon: Map },
    ];

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Church Members</h2>
                        <p className="text-sm text-slate-500 mt-0.5">{members.length} members total</p>
                    </div>
                    <button
                        onClick={() => setShowForm(f => !f)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Member
                    </button>
                </div>

                {/* Add Member Form */}
                {showForm && (
                    <form onSubmit={addMember} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-3 items-end shadow-sm">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">First Name *</label>
                            <input value={firstName} onChange={e => setFirstName(e.target.value)} required
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-36" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">Last Name *</label>
                            <input value={lastName} onChange={e => setLastName(e.target.value)} required
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-36" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48" />
                        </div>
                        <button type="submit" disabled={adding}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                            {adding ? "Saving..." : "Save"}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)}
                            className="text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg text-sm">
                            Cancel
                        </button>
                    </form>
                )}

                {/* Tabs */}
                <div className="border-b border-slate-200">
                    <nav className="flex gap-1">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === id
                                    ? "border-indigo-600 text-indigo-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {tab === "list" && (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search members..."
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>

                        <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b text-slate-500 font-medium text-xs uppercase tracking-wide">
                                    <tr>
                                        {(["name", "email", "phone", "age", "status"] as SortField[]).map(field => (
                                            <th key={field}
                                                onClick={() => handleSort(field)}
                                                className="px-6 py-3 cursor-pointer select-none hover:bg-slate-100 transition-colors group"
                                            >
                                                <span className="flex items-center gap-1">
                                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                                    {sortField === field
                                                        ? sortDir === "asc"
                                                            ? <ChevronUp className="w-3.5 h-3.5 text-indigo-500" />
                                                            : <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                                                        : <ChevronsUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />}
                                                </span>
                                            </th>
                                        ))}
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                            {search ? "No members match your search." : "No members found."}
                                        </td></tr>
                                    ) : filtered.map(member => (
                                        <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                <button
                                                    onClick={() => setEditMember(member)}
                                                    className="text-indigo-700 hover:text-indigo-900 hover:underline font-medium text-left transition-colors"
                                                >
                                                    {member.last_name}, {member.first_name}
                                                </button>
                                                {member.is_kid && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Kid</span>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{member.email || "—"}</td>
                                            <td className="px-6 py-4 text-slate-500">{member.phone || "—"}</td>
                                            <td className="px-6 py-4 text-slate-500 tabular-nums">
                                                {calcAge(member.birthday) ?? "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === "active"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-100 text-slate-500"
                                                    }`}>
                                                    {member.status || "active"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => deleteMember(member.id)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                    title="Delete member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {!loading && <p className="text-xs text-slate-400">{filtered.length} of {members.length} members shown</p>}
                    </div>
                )}

                {tab === "groups" && (
                    <GroupsTab members={members} />
                )}

                {tab === "map" && (
                    <MemberMapView
                        members={members}
                        groups={groups}
                        onMemberUpdated={fetchData}
                    />
                )}
            </div>

            <MemberEditModal
                member={editMember}
                onClose={() => setEditMember(null)}
                onSaved={fetchData}
            />
        </>
    );
}
