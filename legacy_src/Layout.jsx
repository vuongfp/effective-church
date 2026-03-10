import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  Megaphone,
  TicketCheck,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
  Activity,
  FileText,
  Tag,
  Globe,
  Church,
  Briefcase,
  Calendar,
  DollarSign,
  MessageSquare,
  ArrowLeftRight,
  BookOpen,
  Heart,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LanguageProvider, useLang } from "@/components/i18n/LanguageContext";
import { LANGUAGES, t } from "@/components/i18n/translations";
import AIAssistant from "@/components/ai/AIAssistant";

const CRM_NAV = [
  { key: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { key: "Contacts", icon: Users, page: "Contacts" },
  { key: "Accounts", icon: Building2, page: "Accounts" },
  { key: "Groups", icon: Tag, page: "Groups" },
  { key: "Pipeline", icon: TrendingUp, page: "Pipeline" },
  { key: "Activities", icon: Activity, page: "Activities" },
  { key: "Notes", icon: FileText, page: "Notes" },
  { key: "Campaigns", icon: Megaphone, page: "Campaigns" },
  { key: "Tickets", icon: TicketCheck, page: "Tickets" },
  { key: "Reports", icon: BarChart3, page: "Reports" },
];

const CHURCH_NAV = [
  { key: "Dashboard", icon: LayoutDashboard, page: "ChurchDashboard" },
  { key: "Members", icon: Users, page: "ChurchMembers" },
  { key: "Finances", icon: DollarSign, page: "ChurchFinances" },
  { key: "Visitors", icon: Globe, page: "ChurchVisitors" },
  { key: "Staff & Volunteers", icon: Briefcase, page: "ChurchStaff" },
  { key: "Operational Tasks", icon: TicketCheck, page: "OperationalTasks" },
  { key: "Events & Activities", icon: Calendar, page: "ChurchEvents" },
  { key: "Education / Career", icon: Briefcase, page: "EducationCareer" },
  { key: "Kid Church", icon: Users, page: "KidChurch" },
  { key: "Christian Organizations", icon: Building2, page: "ChristianOrganizations" },
  { key: "Announcements & Messages", icon: Megaphone, page: "CommunicationAnnouncement" },
  { key: "Reports", icon: BarChart3, page: "ChurchReports" },
  { key: "User Guide", icon: BookOpen, page: "UserGuide" },
  { key: "User & Role Management", icon: Users, page: "UserRoleManagement" },
  { key: "Audit Logs", icon: BarChart3, page: "AuditLogs" },
  { key: "Settings", icon: Lock, page: "Settings" },
  ];

const CHURCH_PAGES = ["ChurchDashboard", "ChurchMembers", "MemberProfile", "ChurchVisitors", "ChurchStaff", "OnlineGiving", "OperationalTasks", "ChurchEvents", "ChurchFinances", "ChurchFinances", "EducationCareer", "KidChurch", "ChristianOrganizations", "CommunicationAnnouncement", "ChurchReports", "UserGuide", "UserRoleManagement", "AuditLogs", "ChurchGroups", "Settings"];

function LayoutInner({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang } = useLang();

  // Auto-detect mode from current page
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem("app_mode") || "crm";
      return saved;
    } catch { return "crm"; }
  });

  // Check if this is a public page (no sidebar)
  const publicPages = ["Home", "Blog", "AboutUs", "ChurchCRMLanding", "BusinessCRMLanding", "EffectiveLivingLanding", "VisitorSignup", "ChurchHome"];
  const isPublicPage = publicPages.includes(currentPageName);

  const isChurchMode = mode === "church";
  const navItems = isChurchMode ? CHURCH_NAV : CRM_NAV;

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Auto-sync sidebar mode with current page
  useEffect(() => {
    const isChurchPage = CHURCH_PAGES.includes(currentPageName);
    const newMode = isChurchPage ? "church" : "crm";
    if (newMode !== mode) {
      setMode(newMode);
      try { localStorage.setItem("app_mode", newMode); } catch {}
    }
  }, [currentPageName, mode]);

  const switchMode = () => {
    const next = isChurchMode ? "crm" : "church";
    try { localStorage.setItem("app_mode", next); } catch {}
    setMode(next);
    // Navigate to the respective dashboard
    window.location.href = createPageUrl(next === "church" ? "ChurchDashboard" : "Dashboard");
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const sidebarBg = isChurchMode ? "bg-blue-950" : "bg-slate-950";
  const accentColor = isChurchMode ? "bg-blue-500/20 text-blue-300" : "bg-indigo-500/20 text-indigo-300";
  const accentIcon = isChurchMode ? "text-blue-400" : "text-indigo-400";
  const logoBg = isChurchMode ? "bg-blue-500" : "bg-indigo-500";
  const switchBg = isChurchMode ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300" : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300";

  // Get page label
  const activeNav = navItems.find(i => i.page === currentPageName);
  const pageLabel = activeNav ? t(activeNav.key, lang) : currentPageName;

  // If this is a public page, just render children without sidebar
  if (isPublicPage) {
    return children;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarCollapsed ? "w-[80px]" : "w-[260px]"} ${sidebarBg} text-white
        flex flex-col
        transform transition-all duration-300 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
          <div className={`w-8 h-8 rounded-lg ${logoBg} flex items-center justify-center shrink-0`}>
            {isChurchMode ? <Church className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
          </div>
          {(!sidebarCollapsed || sidebarOpen) && (
            <span className="text-lg font-semibold tracking-tight">
              {isChurchMode ? "Effective CHURCH" : "Effective CRM"}
            </span>
          )}
          <button
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode badge */}
        {(!sidebarCollapsed || sidebarOpen) && (
          <div className="px-4 pt-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${isChurchMode ? "bg-blue-500/10 text-blue-300" : "bg-indigo-500/10 text-indigo-300"}`}>
              {isChurchMode ? <Church className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
              <span>{isChurchMode ? "Effective CHURCH" : "EffectiveBUSINESS"}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            // Hide User & Role Management for non-admins
            if (item.page === "UserRoleManagement" && user?.role !== "admin") {
              return null;
            }

            const isActive = currentPageName === item.page;
            // Smart navigation: If Dashboard clicked in church mode, go to ChurchDashboard
            const targetPage = item.page === "Dashboard" && isChurchMode ? "ChurchDashboard" : item.page;
            const isSmartActive = currentPageName === targetPage || (targetPage === "ChurchDashboard" && currentPageName === "ChurchDashboard");
            
            return (
              <Link
                key={item.page}
                to={createPageUrl(targetPage)}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 justify-center lg:justify-start
                  ${isSmartActive ? accentColor : "text-slate-400 hover:text-white hover:bg-white/5"}
                `}
                title={sidebarCollapsed ? t(item.key, lang) : undefined}
              >
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${isSmartActive ? accentIcon : ""}`} />
                {(!sidebarCollapsed || sidebarOpen) && (
                  <>
                    <span>{t(item.key, lang)}</span>
                    {isSmartActive && <ChevronRight className={`w-4 h-4 ml-auto ${accentIcon} hidden lg:inline`} />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-white/10 space-y-2">


          {/* About Us link */}
          {!sidebarCollapsed && (
            <div className="px-3">
              <Link
                to={createPageUrl("Home")}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs w-full"
              >
                <Users className="w-3.5 h-3.5" /> About Us
              </Link>
            </div>
          )}

          {/* Language switcher */}
          <div className="relative px-3">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center justify-center lg:justify-start gap-2 w-full px-2 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
              title={sidebarCollapsed ? currentLang.label : undefined}
            >
              <Globe className="w-4 h-4" />
              {!sidebarCollapsed && <span>{currentLang.flag} {currentLang.label}</span>}
            </button>
            {langOpen && (
              <div className="absolute bottom-full left-3 mb-1 bg-slate-800 border border-white/10 rounded-lg overflow-hidden shadow-xl z-50 w-44">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${lang === l.code ? "bg-indigo-500/20 text-indigo-300" : "text-slate-300 hover:bg-white/5"}`}
                  >
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className={`${isChurchMode ? "bg-blue-500/20 text-blue-300" : "bg-indigo-500/20 text-indigo-300"} text-xs font-medium`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.full_name || "User"}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10 shrink-0"
              onClick={() => base44.auth.logout()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 shrink-0 gap-4">
          <button
            className="lg:hidden mr-4 text-slate-600 hover:text-slate-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            className="hidden lg:block text-slate-600 hover:text-slate-900"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">{pageLabel}</h1>
          {isChurchMode && (
            <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              ⛪ Effective CHURCH
            </span>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <AIAssistant mode={mode} />
    </div>
  );
}

function Layout(props) {
  return (
    <LanguageProvider>
      <LayoutInner {...props} />
    </LanguageProvider>
  );
}

export default Layout;