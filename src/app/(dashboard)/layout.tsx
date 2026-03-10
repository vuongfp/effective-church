import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Church, Sparkles, LogOut, Globe, Menu, X, Users, Briefcase, LayoutDashboard, UserPlus, CalendarDays, FileText, Globe2 } from "lucide-react"
import QueryProvider from "@/components/providers/QueryProvider"
import { LanguageProvider } from "@/components/i18n/LanguageContext"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Determine mode logic (simplifying to Church mode for MVP based on user request)
    const isChurchMode = true
    const sidebarBg = isChurchMode ? "bg-blue-950" : "bg-slate-950"
    const logoBg = isChurchMode ? "bg-blue-500" : "bg-indigo-500"

    return (
        <LanguageProvider>
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                {/* Sidebar */}
                <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] ${sidebarBg} text-white flex flex-col transform transition-all duration-300 ease-out`}>
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
                        <div className={`w-8 h-8 rounded-lg ${logoBg} flex items-center justify-center shrink-0`}>
                            {isChurchMode ? <Church className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-lg font-semibold tracking-tight">
                            {isChurchMode ? "Effective CHURCH" : "Effective CRM"}
                        </span>
                    </div>

                    {/* Mode badge */}
                    <div className="px-4 pt-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-300">
                            <Church className="w-3.5 h-3.5" />
                            <span>Effective CHURCH</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        <a href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 justify-start">
                            <LayoutDashboard className={`w-[18px] h-[18px] shrink-0`} />
                            <span>Dashboard</span>
                        </a>
                        <a href="/members" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 justify-start">
                            <Users className={`w-[18px] h-[18px] shrink-0`} />
                            <span>Members</span>
                        </a>
                        <a href="/visitors" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 justify-start">
                            <UserPlus className={`w-[18px] h-[18px] shrink-0`} />
                            <span>Visitors</span>
                        </a>
                        <a href="/events" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 justify-start">
                            <CalendarDays className={`w-[18px] h-[18px] shrink-0`} />
                            <span>Events</span>
                        </a>
                        <a href="/posts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 justify-start">
                            <FileText className={`w-[18px] h-[18px] shrink-0`} />
                            <span>Tin Tức (CMS)</span>
                        </a>
                        <div className="border-t border-white/10 my-2" />
                        <a href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 justify-start">
                            <Globe2 className={`w-[18px] h-[18px] shrink-0`} />
                            <span>Trang Công Khai ↗</span>
                        </a>
                    </nav>

                    {/* Bottom section (User Info & Logout) */}
                    <div className="px-3 py-4 border-t border-white/10 space-y-2">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-300 text-xs font-medium`}>
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                            <form action="/auth/signout" method="post">
                                <button type="submit" className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 rounded-md">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 shrink-0 gap-4">
                        <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
                        {isChurchMode && (
                            <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                ⛪ Effective CHURCH
                            </span>
                        )}
                    </header>

                    <main className="flex-1 overflow-y-auto p-6">
                        <QueryProvider>
                            {children}
                        </QueryProvider>
                    </main>
                </div>
            </div>
        </LanguageProvider>
    )
}
