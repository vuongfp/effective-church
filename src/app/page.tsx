import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CalendarDays, MapPin, Clock, ChevronRight, BookOpen, Users, Heart, Phone, Mail, Facebook } from "lucide-react";

export const metadata = {
    title: "Hội Thánh Tin Lành Toronto | Effective CHURCH",
    description: "Chào mừng bạn đến với Hội Thánh Tin Lành Toronto — cộng đồng Cơ Đốc nhân Việt Nam tại Toronto.",
};

function fmtDate(d: string | null | undefined) {
    if (!d) return "";
    const dt = new Date(d + "T12:00:00");
    return dt.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

const TYPE_COLORS: Record<string, string> = {
    event: "bg-indigo-100 text-indigo-700",
    meeting: "bg-blue-100 text-blue-700",
    service: "bg-violet-100 text-violet-700",
    prayer: "bg-amber-100 text-amber-700",
    outreach: "bg-emerald-100 text-emerald-700",
    training: "bg-orange-100 text-orange-700",
    task: "bg-slate-100 text-slate-600",
};

export default async function HomePage() {
    const supabase = await createClient();

    const today = new Date().toISOString().slice(0, 10);

    // Fetch upcoming events (non-completed activities with a due_date >= today)
    const { data: events } = await supabase
        .from("activities")
        .select("*")
        .eq("completed", false)
        .gte("due_date", today)
        .order("due_date", { ascending: true })
        .limit(6);

    // Fetch recent published posts
    const { data: posts } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, cover_image, category, published_at, author")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(3);

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* ── NAV ──────────────────────────────────────────────── */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">✝</div>
                        <span className="font-bold text-slate-900 text-base leading-tight">
                            Hội Thánh<br />
                            <span className="text-indigo-600 text-xs font-semibold">Tin Lành Toronto</span>
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        <Link href="/#about" className="hover:text-indigo-600 transition-colors">Giới Thiệu</Link>
                        <Link href="/#events" className="hover:text-indigo-600 transition-colors">Lịch Sinh Hoạt</Link>
                        <Link href="/tin-tuc" className="hover:text-indigo-600 transition-colors">Tin Tức</Link>
                        <Link href="/#contact" className="hover:text-indigo-600 transition-colors">Liên Hệ</Link>
                    </nav>
                    <Link href="/login"
                        className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors">
                        Đăng Nhập
                    </Link>
                </div>
            </header>

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-16"
                style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)" }}>
                {/* Background cross pattern */}
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px)" }} />

                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-8 border border-white/20">
                        ✝ Thành lập năm 1976 · Toronto, Canada
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
                        Hội Thánh<br />
                        <span className="text-indigo-300">Tin Lành Toronto</span>
                    </h1>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Cộng đồng Cơ Đốc nhân Việt Nam tại Toronto — nơi thờ phượng, học Lời Chúa và gắn bó trong tình yêu thương.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/#events"
                            className="flex items-center gap-2 bg-white text-indigo-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                            <CalendarDays className="w-4 h-4" /> Xem Lịch Sinh Hoạt
                        </Link>
                        <Link href="/#about"
                            className="flex items-center gap-2 bg-white/10 text-white border border-white/30 font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors">
                            Tìm Hiểu Thêm <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 text-xs animate-bounce">
                    <span>Cuộn xuống</span>
                    <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
            </section>

            {/* ── WORSHIP TIMES ────────────────────────────────────── */}
            <section className="bg-indigo-600 text-white py-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid sm:grid-cols-3 gap-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <Clock className="w-6 h-6 text-indigo-300" />
                            <p className="font-bold text-lg">Chủ Nhật</p>
                            <p className="text-indigo-100 text-sm">15:30 – 16:30<br />Tiếng Việt (Phòng chính)</p>
                        </div>
                        <div className="hidden sm:block border-x border-indigo-500/50 flex flex-col items-center gap-2">
                            <Clock className="w-6 h-6 text-indigo-300 mx-auto" />
                            <p className="font-bold text-lg">Sunday</p>
                            <p className="text-indigo-100 text-sm">15:30 – 16:30<br />English (Small hall)</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <MapPin className="w-6 h-6 text-indigo-300" />
                            <p className="font-bold text-lg">Địa chỉ</p>
                            <p className="text-indigo-100 text-sm">63 Dunblaine Ave<br />North York, ON M5M 2S2</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ABOUT ────────────────────────────────────────────── */}
            <section id="about" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Về Chúng Tôi</p>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">Một Cộng Đồng Đức Tin Yêu Thương</h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-6">
                            Hội Thánh Tin Lành Toronto (TVAC) được thành lập năm 1976 với tấm lòng yêu mến Chúa, tạo nên
                            một mái nhà thuộc linh ấm áp cho người Việt tại Canada. Chúng tôi tổ chức thờ phượng bằng
                            tiếng Việt và tiếng Anh, học Kinh Thánh, sinh hoạt nhóm nhỏ và các chương trình truyền giáo.
                        </p>
                        <p className="text-slate-500 leading-relaxed mb-8">
                            Chúng tôi trân trọng chào đón quý tín hữu và đồng hương Việt Nam vừa định cư tại Canada —
                            tìm kiếm một cộng đồng đức tin để gắn bó, học hỏi và phát triển trong Lời Chúa.
                        </p>
                        <Link href="/#contact" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
                            Liên Hệ Chúng Tôi <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: BookOpen, label: "Lớp Kinh Thánh", desc: "Hàng tuần cho mọi lứa tuổi" },
                            { icon: Users, label: "Nhóm Nhỏ", desc: "Gắn bó và nâng đỡ nhau" },
                            { icon: Heart, label: "Cộng Đồng", desc: "Tình yêu thương chân thành" },
                            { icon: CalendarDays, label: "Chương Trình", desc: "Thờ phượng, truyền giáo" },
                        ].map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-3">
                                    <Icon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <p className="font-bold text-slate-900 text-sm mb-1">{label}</p>
                                <p className="text-slate-500 text-xs">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── UPCOMING EVENTS ──────────────────────────────────── */}
            <section id="events" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
                        <div>
                            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-2">Lịch Sắp Tới</p>
                            <h2 className="text-4xl font-extrabold text-slate-900">Sinh Hoạt & Sự Kiện</h2>
                        </div>
                        <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
                            Quản lý lịch <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {events && events.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((ev) => (
                                <div key={ev.id} className="group border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all bg-white">
                                    {ev.cover_image_url && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={ev.cover_image_url} alt={ev.subject} className="w-full h-36 object-cover" />
                                    )}
                                    {!ev.cover_image_url && (
                                        <div className={`w-full h-2 ${["bg-indigo-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500"][Math.floor(Math.random() * 4)]}`} />
                                    )}
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            {ev.type && (
                                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${TYPE_COLORS[ev.type] ?? "bg-slate-100 text-slate-500"}`}>
                                                    {ev.type}
                                                </span>
                                            )}
                                            {ev.event_category && (
                                                <span className="text-xs text-slate-400">{ev.event_category}</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-indigo-600 transition-colors">
                                            {ev.subject}
                                        </h3>
                                        <div className="flex flex-col gap-1 text-xs text-slate-500">
                                            {ev.due_date && (
                                                <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-indigo-400" />{fmtDate(ev.due_date)}</span>
                                            )}
                                            {ev.location && (
                                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" />{ev.location}</span>
                                            )}
                                            {ev.responsible_person && (
                                                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-400" />{ev.responsible_person}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400">
                            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Chưa có sự kiện sắp tới. Vui lòng quay lại sau.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── TIN TỨC PREVIEW ──────────────────────────────────── */}
            {posts && posts.length > 0 && (
                <section className="py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
                            <div>
                                <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-2">Mục Tin Tức</p>
                                <h2 className="text-4xl font-extrabold text-slate-900">Tin Tức Mới Nhất</h2>
                            </div>
                            <Link href="/tin-tuc" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
                                Xem tất cả <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {posts.map(post => (
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
                                        {post.category && (
                                            <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">{post.category}</span>
                                        )}
                                        <h3 className="font-bold text-slate-900 text-base mt-1 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">{post.title}</h3>
                                        {post.excerpt && <p className="text-slate-500 text-sm line-clamp-2">{post.excerpt}</p>}
                                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                                            <span>{post.author}</span>
                                            {post.published_at && <span>· {new Date(post.published_at).toLocaleDateString("vi-VN")}</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CONTACT ──────────────────────────────────────────── */}
            <section id="contact" className="py-24 bg-indigo-950 text-white">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">Liên Hệ</p>
                    <h2 className="text-4xl font-extrabold mb-10">Kết Nối Với Chúng Tôi</h2>
                    <div className="grid sm:grid-cols-3 gap-8 mb-12">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-indigo-800 flex items-center justify-center"><MapPin className="w-5 h-5 text-indigo-300" /></div>
                            <p className="font-semibold">Địa Chỉ</p>
                            <p className="text-indigo-200 text-sm text-center">63 Dunblaine Ave<br />North York, ON M5M 2S2</p>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-indigo-800 flex items-center justify-center"><Phone className="w-5 h-5 text-indigo-300" /></div>
                            <p className="font-semibold">Điện Thoại</p>
                            <p className="text-indigo-200 text-sm">Pastor Ninh Tran<br />416-658-1620</p>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-indigo-800 flex items-center justify-center"><Mail className="w-5 h-5 text-indigo-300" /></div>
                            <p className="font-semibold">Email</p>
                            <a href="mailto:tinlanhtoronto@gmail.com" className="text-indigo-300 hover:text-white transition-colors text-sm">tinlanhtoronto@gmail.com</a>
                        </div>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <a href="https://www.facebook.com/vuongminhnhut.jackie" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                            <Facebook className="w-4 h-4" /> Facebook
                        </a>
                        <Link href="/login" className="flex items-center gap-2 bg-white text-indigo-900 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors">
                            Đăng Nhập Quản Lý
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────── */}
            <footer className="bg-indigo-950 border-t border-indigo-900/50 py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-indigo-400">
                    <p>© {new Date().getFullYear()} Hội Thánh Tin Lành Toronto. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/tin-tuc" className="hover:text-white transition-colors">Tin Tức</Link>
                        <Link href="/#about" className="hover:text-white transition-colors">Giới Thiệu</Link>
                        <Link href="/login" className="hover:text-white transition-colors">Đăng Nhập</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
