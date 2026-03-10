"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Plus, Search, Pencil, Trash2, Save, Loader2, X,
    Eye, EyeOff, Star, StarOff, ImagePlus, ChevronDown, ChevronUp, Tag
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────── */
interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    content?: string | null;
    cover_image?: string | null;
    category?: string | null;
    tags?: string[];
    author?: string | null;
    published: boolean;
    featured: boolean;
    created_at: string;
    published_at?: string | null;
}

const CATEGORIES = ["Thờ Phượng", "Truyền Giáo", "Thanh Thiếu Niên", "Kinh Thánh", "Thông Báo", "Khác"];

function slugify(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Post Modal / Editor ─────────────────────────────────────── */
function PostModal({ post, onClose, onSaved }: { post: Partial<Post> | null; onClose: () => void; onSaved: () => void }) {
    const supabase = createClient();
    const [form, setForm] = useState<Partial<Post>>({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState("");
    const [advanced, setAdvanced] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (post?.id) {
            setForm({ ...post });
            setAdvanced(!!(post.cover_image || post.tags?.length));
        } else {
            setForm({ published: false, featured: false, author: "Admin", category: "Thông Báo", tags: [] });
        }
    }, [post]);

    const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        const ext = file.name.split(".").pop();
        const path = `posts/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("post-images").upload(path, file, { upsert: true });
        if (error) { setErr(error.message); setUploading(false); return; }
        const { data } = supabase.storage.from("post-images").getPublicUrl(path);
        set("cover_image", data.publicUrl);
        setUploading(false);
    };

    const addTag = () => {
        const t = tagInput.trim();
        if (!t) return;
        const current = form.tags || [];
        if (!current.includes(t)) set("tags", [...current, t]);
        setTagInput("");
    };
    const removeTag = (t: string) => set("tags", (form.tags || []).filter(x => x !== t));

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title?.trim()) return;
        setSaving(true); setErr(null);

        const slug = form.slug?.trim() || slugify(form.title);
        const payload: Partial<Post> = {
            ...form,
            slug,
            published_at: form.published && !form.published_at ? new Date().toISOString() : form.published_at,
        };

        let error;
        if (post?.id) {
            ({ error } = await supabase.from("posts").update(payload).eq("id", post.id));
        } else {
            ({ error } = await supabase.from("posts").insert([{ ...payload }]));
        }
        setSaving(false);
        if (error) { setErr(error.message); return; }
        onSaved(); onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <h2 className="text-lg font-bold text-slate-900">{post?.id ? "Sửa Bài Viết" : "Bài Viết Mới"}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Title */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tiêu Đề *</label>
                        <input value={form.title || ""} onChange={e => {
                            set("title", e.target.value);
                            if (!post?.id) set("slug", slugify(e.target.value));
                        }} required placeholder="Nhập tiêu đề bài viết…"
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium" />
                    </div>

                    {/* Slug + Author */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Slug (URL)</label>
                            <input value={form.slug || ""} onChange={e => set("slug", e.target.value)}
                                placeholder="tu-dong-tao-tu-tieu-de"
                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono text-xs" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tác Giả</label>
                            <input value={form.author || ""} onChange={e => set("author", e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Danh Mục</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(c => (
                                <button key={c} type="button" onClick={() => set("category", c)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.category === c ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500 hover:border-indigo-300"}`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tóm Tắt</label>
                        <textarea value={form.excerpt || ""} onChange={e => set("excerpt", e.target.value)} rows={2}
                            placeholder="Đoạn giới thiệu ngắn hiển thị trên danh sách…"
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nội Dung (HTML)</label>
                        <textarea value={form.content || ""} onChange={e => set("content", e.target.value)} rows={10}
                            placeholder="<p>Nội dung bài viết…</p>"
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y font-mono" />
                    </div>

                    {/* Publish toggles */}
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div onClick={() => set("published", !form.published)}
                                className={`w-11 h-6 rounded-full transition-colors ${form.published ? "bg-emerald-500" : "bg-slate-200"} relative`}>
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.published ? "translate-x-5" : ""}`} />
                            </div>
                            <span className="text-sm text-slate-700 font-medium">Công Khai</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div onClick={() => set("featured", !form.featured)}
                                className={`w-11 h-6 rounded-full transition-colors ${form.featured ? "bg-amber-500" : "bg-slate-200"} relative`}>
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.featured ? "translate-x-5" : ""}`} />
                            </div>
                            <span className="text-sm text-slate-700 font-medium">⭐ Nổi Bật</span>
                        </label>
                    </div>

                    {/* Advanced: Cover Image + Tags */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <button type="button" onClick={() => setAdvanced(v => !v)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700">
                            <span className="flex items-center gap-2">
                                🖼️ Nâng Cao (Ảnh bìa, Tags)
                                {(form.cover_image || (form.tags?.length ?? 0) > 0) && (
                                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                                        {[form.cover_image ? "Ảnh bìa" : "", (form.tags?.length ?? 0) > 0 ? `${form.tags?.length} tags` : ""].filter(Boolean).join(" · ")}
                                    </span>
                                )}
                            </span>
                            {advanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        {advanced && (
                            <div className="px-4 py-4 space-y-4 border-t border-slate-200">
                                {/* Cover Image */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                        <ImagePlus className="w-3.5 h-3.5" /> Ảnh Bìa
                                    </label>
                                    {form.cover_image ? (
                                        <div className="relative rounded-xl overflow-hidden h-32 border border-slate-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={form.cover_image} alt="Cover" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => set("cover_image", null)}
                                                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div onClick={() => fileRef.current?.click()}
                                            className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                                            {uploading ? <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /> : (
                                                <><ImagePlus className="w-5 h-5 text-slate-400" /><p className="text-xs text-slate-400">Click để tải ảnh bìa lên (PNG, JPG — max 10MB)</p></>
                                            )}
                                        </div>
                                    )}
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                                </div>
                                {/* Tags */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                        <Tag className="w-3.5 h-3.5" /> Tags
                                    </label>
                                    <div className="flex gap-2">
                                        <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                                            placeholder="Nhập tag, nhấn Enter để thêm…"
                                            className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                                        <button type="button" onClick={addTag} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">Thêm</button>
                                    </div>
                                    {(form.tags?.length ?? 0) > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {form.tags!.map(t => (
                                                <span key={t} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full">
                                                    {t}
                                                    <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {err && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
                </form>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors">Huỷ</button>
                    <button onClick={handleSave as unknown as React.MouseEventHandler} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Đang lưu…" : "Lưu Bài Viết"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main CMS Page ───────────────────────────────────────────── */
export default function PostsPage() {
    const supabase = createClient();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
    const [modal, setModal] = useState<Partial<Post> | null | undefined>(undefined);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
        setPosts(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const deletePost = async (id: string, title: string) => {
        if (!confirm(`Xoá bài viết "${title}"?`)) return;
        await supabase.from("posts").delete().eq("id", id);
        fetchPosts();
    };

    const togglePublish = async (p: Post) => {
        const payload = {
            published: !p.published,
            published_at: !p.published ? new Date().toISOString() : p.published_at,
        };
        await supabase.from("posts").update(payload).eq("id", p.id);
        fetchPosts();
    };

    const toggleFeatured = async (p: Post) => {
        await supabase.from("posts").update({ featured: !p.featured }).eq("id", p.id);
        fetchPosts();
    };

    const filtered = posts.filter(p => {
        const matchQ = !search || p.title.toLowerCase().includes(search.toLowerCase());
        const matchF = filter === "all" || (filter === "published" ? p.published : !p.published);
        return matchQ && matchF;
    });

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.published).length,
        drafts: posts.filter(p => !p.published).length,
        featured: posts.filter(p => p.featured).length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quản Lý Bài Viết (CMS)</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{posts.length} bài viết · {stats.published} công khai · {stats.drafts} bản nháp</p>
                </div>
                <div className="flex gap-2">
                    <a href="/tin-tuc" target="_blank"
                        className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Eye className="w-4 h-4" /> Xem trang Tin Tức
                    </a>
                    <button onClick={() => setModal({})}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> Bài Viết Mới
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Tổng Cộng", value: stats.total, color: "text-slate-900", bg: "bg-slate-50" },
                    { label: "Công Khai", value: stats.published, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Bản Nháp", value: stats.drafts, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Nổi Bật", value: stats.featured, color: "text-violet-600", bg: "bg-violet-50" },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl px-5 py-4 border border-slate-100`}>
                        <p className="text-xs font-medium text-slate-500">{label}</p>
                        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bài viết…"
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="flex gap-1.5">
                    {(["all", "published", "draft"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === f ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500 hover:border-indigo-300"}`}>
                            {f === "all" ? "Tất Cả" : f === "published" ? "Công Khai" : "Bản Nháp"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                    <p className="text-sm font-medium">Không tìm thấy bài viết nào.</p>
                    <button onClick={() => setModal({})} className="text-sm text-indigo-600 hover:underline">Tạo bài viết đầu tiên</button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Tiêu Đề</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Danh Mục</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Ngày Tạo</th>
                                <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Trạng Thái</th>
                                <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {p.cover_image && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={p.cover_image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                            )}
                                            <div>
                                                <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{p.title}</p>
                                                <p className="text-xs text-slate-400 font-mono">/tin-tuc/{p.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        {p.category && <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">{p.category}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">{fmtDate(p.created_at)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${p.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                                {p.published ? "Công Khai" : "Nháp"}
                                            </span>
                                            {p.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⭐</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => togglePublish(p)} title={p.published ? "Ẩn bài" : "Công khai"}
                                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                                                {p.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                            <button onClick={() => toggleFeatured(p)} title={p.featured ? "Bỏ nổi bật" : "Đặt nổi bật"}
                                                className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition-colors">
                                                {p.featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                                            </button>
                                            <a href={`/tin-tuc/${p.slug}`} target="_blank" title="Xem bài"
                                                className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                                                <Eye className="w-3.5 h-3.5" />
                                            </a>
                                            <button onClick={() => setModal(p)} title="Sửa"
                                                className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => deletePost(p.id, p.title)} title="Xoá"
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal !== undefined && (
                <PostModal post={modal} onClose={() => setModal(undefined)} onSaved={fetchPosts} />
            )}
        </div>
    );
}
