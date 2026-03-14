"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GalleryItem } from "@/types";
import { Plus, Trash2, CalendarDays, Tag, Image as ImageIcon, Loader2 } from "lucide-react";

export default function GalleryManagement() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventName, setEventName] = useState("");
    const [tagsInput, setTagsInput] = useState("");

    const supabase = createClient();

    useEffect(() => {
        fetchGallery();
    }, []);

    async function fetchGallery() {
        setLoading(true);
        const { data } = await supabase
            .from("gallery")
            .select("*")
            .order("created_at", { ascending: false });
        if (data) setItems(data);
        setLoading(false);
    }

    async function handleAddImage(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        
        const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t !== "");
        
        const { error } = await supabase.from("gallery").insert({
            title,
            description,
            image_url: imageUrl,
            event_date: eventDate || null,
            event_name: eventName,
            tags
        });

        if (error) {
            alert("Lỗi khi thêm ảnh: " + error.message);
        } else {
            setTitle("");
            setDescription("");
            setImageUrl("");
            setEventDate("");
            setEventName("");
            setTagsInput("");
            fetchGallery();
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
        
        const { error } = await supabase.from("gallery").delete().eq("id", id);
        if (error) alert("Lỗi khi xóa: " + error.message);
        else fetchGallery();
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Quản lý Thư viện ảnh</h2>
                        <p className="text-slate-500 text-sm">Thêm và quản lý hình ảnh hoạt động của Hội Thánh</p>
                    </div>
                </div>

                <form onSubmit={handleAddImage} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tiêu đề ảnh *</label>
                            <input required value={title} onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                                placeholder="VD: Lễ Giáng Sinh 2024" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24" 
                                placeholder="Ghi chú ngắn về bức ảnh..." />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Hình ảnh *</label>
                            <input required value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                                placeholder="https://example.com/photo.jpg" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên Sự kiện</label>
                            <input value={eventName} onChange={e => setEventName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                                placeholder="VD: Trại Hè Phụ Nữ" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày diễn ra</label>
                            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tags (cách nhau bởi dấu phẩy)</label>
                            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                                placeholder="kỷ niệm, dã ngoại, thanh niên" />
                        </div>
                        <button type="submit" disabled={saving}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            Thêm Ảnh vào Thư Viện
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Danh sách hình ảnh</h3>
                </div>
                {loading ? (
                    <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {items.map(item => (
                            <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <CalendarDays className="w-3.5 h-3.5" />
                                            {item.event_date || "Không ngày"}
                                        </div>
                                        {item.event_name && (
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <ImageIcon className="w-3.5 h-3.5" />
                                                {item.event_name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {item.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                <Tag className="w-2 h-2" /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(item.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Xóa">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        {items.length === 0 && <div className="p-20 text-center text-slate-400">Chưa có ảnh nào trong thư viện</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
