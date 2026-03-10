"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Save, Loader2 } from "lucide-react";

interface Member {
    id: string;
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
    sex?: string | null;
    marital_status?: string | null;
    birthday?: string | null;
    baptism?: string | boolean | null;
    address?: string | null;
    status?: string | null;
    member_since?: string | null;
    notes?: string | null;
    is_kid?: boolean | null;
    [key: string]: unknown;
}

interface Group { id: string; name: string; }

interface Props {
    member: Member | null;
    onClose: () => void;
    onSaved: () => void;
}

const PROFESSIONS = [
    "student", "teacher", "engineer", "doctor", "nurse", "business",
    "farmer", "clergy", "artist", "lawyer", "accountant", "it",
    "social_worker", "homemaker", "retired", "unemployed", "other",
];

export default function MemberEditModal({ member, onClose, onSaved }: Props) {
    const supabase = createClient();
    const [form, setForm] = useState<Partial<Member>>({});
    const [groups, setGroups] = useState<Group[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (member) setForm({ ...member });
    }, [member]);

    useEffect(() => {
        supabase.from("groups").select("*").then(({ data }) => setGroups(data || []));
    }, []);

    if (!member) return null;

    const set = (key: string, val: unknown) =>
        setForm(prev => ({ ...prev, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const { id, ...data } = form;
        // Supabase doesn't accept undefined — convert to null
        const clean: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(data)) {
            clean[k] = v === undefined || v === "" ? null : v;
        }
        const { error: err } = await supabase
            .from("members")
            .update(clean)
            .eq("id", member.id);
        setSaving(false);
        if (err) { setError(err.message); return; }
        onSaved();
        onClose();
    };

    const field = (label: string, content: React.ReactNode) => (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
            {content}
        </div>
    );

    const inp = (key: string, type = "text", placeholder?: string) => (
        <input
            type={type}
            value={(form[key] as string) || ""}
            onChange={e => set(key, e.target.value)}
            placeholder={placeholder}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        />
    );

    const sel = (key: string, options: { value: string; label: string }[], placeholder?: string) => (
        <select
            value={(form[key] as string) || ""}
            onChange={e => set(key, e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Edit Member Profile</h2>
                        <p className="text-sm text-slate-400">{member.first_name} {member.last_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* Name */}
                    <div className="grid grid-cols-2 gap-4">
                        {field("First Name *", inp("first_name"))}
                        {field("Last Name *", inp("last_name"))}
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        {field("Email", inp("email", "email"))}
                        {field("Phone", inp("phone", "tel"))}
                    </div>

                    {/* Gender + Marital */}
                    <div className="grid grid-cols-2 gap-4">
                        {field("Gender", sel("sex", [
                            { value: "M", label: "Male" },
                            { value: "F", label: "Female" },
                        ], "— Select —"))}
                        {field("Marital Status", sel("marital_status", [
                            { value: "Single", label: "Single" },
                            { value: "Married", label: "Married" },
                            { value: "Widowed", label: "Widowed" },
                            { value: "Divorced", label: "Divorced" },
                        ], "— Select —"))}
                    </div>

                    {/* Birthday + Member Since */}
                    <div className="grid grid-cols-2 gap-4">
                        {field("Birthday", inp("birthday", "date"))}
                        {field("Member Since", inp("member_since", "date"))}
                    </div>

                    {/* Address */}
                    {field("Address", inp("address"))}

                    {/* Status + is_kid */}
                    <div className="grid grid-cols-2 gap-4">
                        {field("Status", sel("status", [
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                            { value: "deceased", label: "Deceased" },
                            { value: "transferred", label: "Transferred" },
                        ]))}
                        {field("Baptism", (
                            <div className="flex gap-2 mt-0.5">
                                {[
                                    { val: true, label: "✓ Baptized" },
                                    { val: false, label: "Not yet" },
                                ].map(({ val, label }) => (
                                    <button
                                        key={String(val)}
                                        type="button"
                                        onClick={() => set("baptism", val)}
                                        className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${!!form.baptism === val
                                                ? val
                                                    ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-medium"
                                                    : "bg-slate-100 border-slate-400 text-slate-700 font-medium"
                                                : "border-slate-200 text-slate-400 hover:border-slate-300"
                                            }`}
                                    >{label}</button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Kids toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => set("is_kid", !form.is_kid)}
                            className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${form.is_kid ? "bg-indigo-500" : "bg-slate-200"}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_kid ? "translate-x-5" : ""}`} />
                        </button>
                        <span className="text-sm text-slate-600">Children member (Kid)</span>
                    </div>

                    {/* Notes */}
                    {field("Notes", (
                        <textarea
                            value={(form.notes as string) || ""}
                            onChange={e => set("notes", e.target.value)}
                            rows={3}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white"
                        />
                    ))}

                    {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit as unknown as React.MouseEventHandler}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
