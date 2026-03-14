import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Calendar, User, Tag } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data } = await supabase.from("posts").select("title, excerpt").eq("slug", slug).eq("published", true).single();
    if (!data) return { title: "Bài viết không tồn tại" };
    return { title: `${data.title} | Tin Tức`, description: data.excerpt };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: post } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

    if (!post) notFound();

    // Related posts
    const { data: related } = await supabase
        .from("posts")
        .select("id, slug, title, cover_image, published_at")
        .eq("published", true)
        .neq("id", post.id)
        .eq("category", post.category)
        .limit(3);

    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">✝</div>
                        <span className="font-bold text-slate-900 text-sm">Hội Thánh Tin Lành Toronto</span>
                    </Link>
                </div>
            </header>

            {/* Cover */}
            <div className="pt-16">
                {post.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover_image} alt={post.title} className="w-full h-72 sm:h-96 object-cover" />
                ) : (
                    <div className="w-full h-40 bg-gradient-to-r from-indigo-900 to-violet-900" />
                )}
            </div>

            {/* Article */}
            <article className="max-w-3xl mx-auto px-6 py-12">
                <Link href="/tin-tuc" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-8 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Quay lại Tin Tức
                </Link>

                {post.category && (
                    <div className="flex items-center gap-2 mb-4">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">{post.category}</span>
                    </div>
                )}

                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">{post.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-10 pb-10 border-b border-slate-100">
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
                    {post.published_at && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.published_at).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                    )}
                    {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {post.tags.map((tag: string) => (
                                <span key={tag} className="bg-slate-100 text-slate-500 text-xs px-2.5 py-0.5 rounded-full">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {post.excerpt && (
                    <p className="text-xl text-slate-500 leading-relaxed mb-8 font-light italic border-l-4 border-indigo-200 pl-5">
                        {post.excerpt}
                    </p>
                )}

                {/* Rich content — stored as HTML */}
                {post.content && (
                    <div
                        className="prose prose-slate prose-lg max-w-none
                            prose-headings:font-bold prose-headings:text-slate-900
                            prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-xl prose-blockquote:border-indigo-400 prose-blockquote:text-slate-600"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                )}
            </article>

            {/* Related */}
            {related && related.length > 0 && (
                <section className="bg-slate-50 py-16">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Bài Viết Liên Quan</h2>
                        <div className="grid sm:grid-cols-3 gap-6">
                            {related.map(r => (
                                <Link key={r.id} href={`/tin-tuc/${r.slug}`}
                                    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-md transition-all">
                                    {r.cover_image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={r.cover_image} alt={r.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-36 bg-indigo-50" />
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{r.title}</h3>
                                        {r.published_at && <p className="text-xs text-slate-400 mt-1">{new Date(r.published_at).toLocaleDateString("vi-VN")}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <footer className="bg-indigo-950 py-8 text-center text-sm text-indigo-400">
                <p>© {new Date().getFullYear()} Hội Thánh Tin Lành Toronto · <Link href="/" className="hover:text-white">Trang Chủ</Link></p>
            </footer>
        </div>
    );
}
