"use client";

import React from "react";
import { Church, LogOut, Users, LayoutDashboard, UserPlus, CalendarDays, FileText, Globe2 } from "lucide-react";
import { useLang } from "@/components/i18n/LanguageContext";
import { LangSwitcher } from "@/components/i18n/LangSwitcher";
import { t } from "@/components/i18n/translations";

interface Props {
    userEmail: string;
}

export default function DashboardSidebar({ userEmail }: Props) {
    const { lang } = useLang();
    const initial = userEmail?.charAt(0).toUpperCase() ?? "?";

    const navItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: t("nav_dashboard", lang) },
        { href: "/members", icon: Users, label: t("nav_members", lang) },
        { href: "/visitors", icon: UserPlus, label: t("nav_visitors", lang) },
        { href: "/events", icon: CalendarDays, label: t("nav_events", lang) },
        { href: "/posts", icon: FileText, label: t("nav_posts", lang) },
    ];

    return (
        <aside className="fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-blue-950 text-white flex flex-col transform transition-all duration-300 ease-out">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                    <Church className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-semibold tracking-tight">Effective CHURCH</span>
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
                {navItems.map(({ href, icon: Icon, label }) => (
                    <a key={href} href={href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150">
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        <span>{label}</span>
                    </a>
                ))}

                <div className="border-t border-white/10 my-2" />

                <a href="/" target="_blank"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150">
                    <Globe2 className="w-[18px] h-[18px] shrink-0" />
                    <span>{t("nav_public_site", lang)}</span>
                </a>
            </nav>

            {/* Bottom: Lang switcher + User + Logout */}
            <div className="px-3 py-4 border-t border-white/10 space-y-3">
                {/* Language switcher */}
                <div className="flex items-center justify-between px-3">
                    <span className="text-xs text-slate-500 font-medium">
                        {lang === "vi" ? "Ngôn ngữ" : "Language"}
                    </span>
                    <LangSwitcher />
                </div>

                {/* User info + logout */}
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-300 text-xs font-medium">
                        {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                    </div>
                    <form action="/auth/signout" method="post">
                        <button type="submit" title={t("common_logout", lang)}
                            className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}
