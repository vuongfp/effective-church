import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, ChevronRight, Calendar, User } from "lucide-react";

export const metadata = {
    title: "Tin Tức | Hội Thánh Tin Lành Toronto",
    description: "Tin tức, thông báo và bài viết mới nhất từ Hội Thánh Tin Lành Toronto.",
};

const CATEGORIES = ["Tất Cả", "Thờ Phượng", "Truyền Giáo", "Thanh Thiếu Niên", "Kinh Thánh", "Thông Báo", "Khác"];

export default async function TinTucPage({
    searchParams,
}: {
    searchParams: Promise<{ cat?: string; q?: string }>;
}) {
    const { cat, q } = await searchParams;
    const supabase = await createClient();

    let query = supabase
        .from("posts")
        .select("id, slug, title, excerpt, cover_image, category, published_at, author, featured")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false });

    if (cat && cat !== "Tất Cả") query = query.eq("category", cat);
    if (q) query = query.ilike("title", `%${q}%`);

    const { data: posts } = await query;

    const featured = posts?.find(p => p.featured);
    const rest = posts?.filter(p => !p.featured || cat || q);

    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">✝</div>
                        <span className="font-bold text-slate-900 text-sm">Hội Thánh Tin Lành Toronto</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        <Link href="/#about" className="hover:text-indigo-600 transition-colors">Giới Thiệu</Link>
                        <Link href="/#events" className="hover:text-indigo-600 transition-colors">Lịch Sinh Hoạt</Link>
                        <Link href="/tin-tuc" className="text-indigo-600 font-semibold">Tin Tức</Link>
                        <Link href="/#contact" className="hover:text-indigo-600 transition-colors">Liên Hệ</Link>
                    </nav>
                    <Link href="/login" className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors">
                        Đăng Nhập
                    </Link>
                </div>
            </header>

            {/* Page header */}
            <div className="pt-16 bg-gradient-to-b from-indigo-950 to-indigo-800 text-white py-20 text-center">
                <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-3">Thông Tin & Bài Viết</p>
                <h1 className="text-5xl font-extrabold mb-4">Tin Tức</h1>
                <p className="text-indigo-200 max-w-lg mx-auto">Cập nhật tin tức, thông báo và bài viết mới nhất từ Hội Thánh.</p>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Search + Category filter */}
                <form method="GET" className="flex flex-col sm:flex-row gap-3 mb-10">
                    <input name="q" defaultValue={q} placeholder="Tìm kiếm bài viết…"
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    <select name="cat" defaultValue={cat || "Tất Cả"}
                        className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors">
                        Tìm
                    </button>
                </form>

                {/* Featured post */}
                {featured && !cat && !q && (
                    <Link href={`/tin-tuc/${featured.slug}`} className="group block mb-12 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                        <div className="grid md:grid-cols-2">
                            {featured.cover_image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={featured.cover_image} alt={featured.title} className="w-full h-72 md:h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-72 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                    <BookOpen className="w-20 h-20 text-white/40" />
                                </div>
                            )}
                            <div className="p-8 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">⭐ Nổi Bật</span>
                                    {featured.category && <span className="text-slate-400 text-xs">{featured.category}</span>}
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{featured.title}</h2>
                                {featured.excerpt && <p className="text-slate-500 mb-6 leading-relaxed">{featured.excerpt}</p>}
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{featured.author}</span>
                                    {featured.published_at && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(featured.published_at).toLocaleDateString("vi-VN")}</span>}
                                </div>
                                <span className="mt-6 inline-flex items-center gap-1.5 text-indigo-600 font-semibold text-sm group-hover:gap-2.5 transition-all">
                                    Đọc thêm <ChevronRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Posts grid */}
                {rest && rest.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rest.map(post => (
                            <Link key={post.id} href={`/tin-tuc/${post.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all">
                                {post.cover_image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={post.cover_image} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                                        <BookOpen className="w-10 h-10 text-indigo-300" />
                                    </div>
                                )}
                                <div className="p-5">
                                    {post.category && <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">{post.category}</span>}
                                    <h3 className="font-bold text-slate-900 text-base mt-1 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">{post.title}</h3>
                                    {post.excerpt && <p className="text-slate-500 text-sm line-clamp-2 mb-3">{post.excerpt}</p>}
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                                        {post.published_at && <span>{new Date(post.published_at).toLocaleDateString("vi-VN")}</span>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Chưa có bài viết nào.</p>
                        {(cat || q) && <Link href="/tin-tuc" className="text-indigo-500 hover:underline text-sm mt-2 block">Xem tất cả bài viết</Link>}
                    </div>
                )}
            </div>

            <footer className="bg-indigo-950 py-8 text-center text-sm text-indigo-400">
                <p>© {new Date().getFullYear()} Hội Thánh Tin Lành Toronto · <Link href="/" className="hover:text-white">Trang Chủ</Link> · <Link href="/login" className="hover:text-white">Đăng Nhập</Link></p>
            </footer>
        </div>
    );
}
