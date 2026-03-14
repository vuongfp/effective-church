"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GalleryItem } from "@/types";
import { CalendarDays, Tag, Image as ImageIcon, Search } from "lucide-react";

export default function GallerySection() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);

    useEffect(() => {
        async function fetchGallery() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("gallery")
                .select("*")
                .order("event_date", { ascending: false });

            if (data) {
                setItems(data);
                const tags = new Set<string>();
                data.forEach(item => {
                    item.tags?.forEach((tag: string) => tags.add(tag));
                });
                setAllTags(Array.from(tags));
            }
            setLoading(false);
        }
        fetchGallery();
    }, []);

    const filteredItems = selectedTag 
        ? items.filter(item => item.tags?.includes(selectedTag))
        : items;

    if (loading) return (
        <div className="py-24 text-center text-slate-400">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p>Đang tải thư viện ảnh...</p>
        </div>
    );

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Kỷ Niệm & Hoạt Động</p>
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Thư Viện Ảnh</h2>
                    <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full" />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedTag ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                        Tất cả
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTag === tag ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>

                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredItems.map((item) => (
                            <div key={item.id} className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300">
                                <div className="aspect-[4/3] overflow-hidden relative">
                                    <img 
                                        src={item.image_url} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-end p-6">
                                        <p className="text-white text-sm font-medium self-end">{item.description}</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                        {item.title}
                                    </h3>
                                    
                                    <div className="flex flex-col gap-2">
                                        {item.event_name && (
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                                                <span>{item.event_name}</span>
                                            </div>
                                        )}
                                        {item.event_date && (
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                                                <span>{new Date(item.event_date).toLocaleDateString("vi-VN", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                        )}
                                    </div>

                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                    <Tag className="w-2.5 h-2.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Không tìm thấy ảnh nào</h3>
                        <p className="text-slate-500">Vui lòng thử chọn tag khác hoặc quay lại sau.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
