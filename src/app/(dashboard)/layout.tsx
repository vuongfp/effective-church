import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import QueryProvider from "@/components/providers/QueryProvider"
import { LanguageProvider } from "@/components/i18n/LanguageContext"
import DashboardSidebar from "@/components/church/DashboardSidebar"

export const metadata = {
    title: "Dashboard",
    description: "Effective Church management dashboard.",
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    return (
        <LanguageProvider>
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                {/* Client sidebar — has lang switcher */}
                <DashboardSidebar userEmail={user.email ?? ""} />

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 shrink-0 gap-4">
                        <h1 className="text-lg font-semibold text-slate-900">Effective CHURCH</h1>
                        <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            ⛪ Admin
                        </span>
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
