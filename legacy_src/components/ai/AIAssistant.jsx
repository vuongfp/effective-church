import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/components/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

const WELCOME = {
  en: "Hi! I'm your AI assistant. Ask me anything about your CRM data, church members, finances, deals, contacts, and more.",
  fr: "Bonjour ! Je suis votre assistant IA. Posez-moi des questions sur vos données CRM, membres, finances, deals, contacts, etc.",
  vi: "Xin chào! Tôi là trợ lý AI của bạn. Hãy hỏi tôi bất cứ điều gì về dữ liệu CRM, thành viên hội thánh, tài chính, deals, liên hệ,...",
};

const PLACEHOLDER = {
  en: "Ask about contacts, deals, members, finances...",
  fr: "Posez une question sur les contacts, deals, membres...",
  vi: "Hỏi về liên hệ, deals, thành viên, tài chính...",
};

const PAGE_URLS = {
  Contacts: "Contacts",
  Accounts: "Accounts",
  Pipeline: "Pipeline",
  Tickets: "Tickets",
  Campaigns: "Campaigns",
  Activities: "Activities",
  Notes: "Notes",
  Groups: "Groups",
  Reports: "Reports",
  Dashboard: "Dashboard",
  ChurchMembers: "ChurchMembers",
  ChurchGroups: "ChurchGroups",
  ChurchEvents: "ChurchEvents",
  ChurchFinances: "ChurchFinances",
  ChurchMessages: "ChurchMessages",
  ChurchDashboard: "ChurchDashboard",
};

const SYSTEM_CONTEXT = `You are an AI assistant embedded in a dual-mode application:
1. EffectiveCRM - a business CRM with Contacts, Accounts, Opportunities (Pipeline), Activities, Notes, Campaigns, Tickets, Groups, Reports.
2. ChurchCRM - a church management system with Members, Groups/Cells, Events, Finances, Messages, Notes, Reports.

CURRENT DATE: ${new Date().toISOString().split("T")[0]}

DATA STRUCTURE (very important - do NOT confuse these):
- "activities" array = Church Events & Activities (type: call/email/meeting/note/task/event). When user asks about "events", "church events", "activities" → use this array. Fields: subject, type, due_date, location, event_category, responsible_person, expected_attendance, attendee_ids.
- "attendanceRecords" array = Sunday Service Attendance Records (how many people attended Sunday service + tithe collected). Fields: date, attendance (number of people), tithe_cad (offering amount). When user asks about "Sunday attendance", "tithe", "offering", "how many attended service" → use this array.
- NEVER answer "events in [month]" using attendanceRecords. Only use attendanceRecords for attendance/tithe/offering questions.

CRITICAL DATA RULES:
- When asked about counts or filters (e.g., "open tickets", "active contacts"), you MUST filter the data accurately.
- For example, if asked "how many open tickets?", count ONLY tickets where status === "open", not all tickets.
- NEVER guess numbers. Always count from the actual data provided.
- The data array provided contains ALL records — use the full array for counting and filtering.
- Double-check your filtering logic before responding.

CHURCH MEMBERS DEFINITION (very important):
- The "members" array contains ALL contacts.
- "Total members" = ALL contacts regardless of is_kid or status. Use the pre-computed total.
- "Kids" or "kid church members" = contacts where is_kid === true.
- When user asks "how many members?" or "total members", use the PRE-COMPUTED total which includes everyone.

AGE CALCULATION RULES (very important):
- Today's date is: ${new Date().toISOString().split("T")[0]} (YYYY-MM-DD). Current year = ${new Date().getFullYear()}.
- Birthday field formats: "YYYY-MM-DD", "D-Mon-YY" (e.g. "6-Mar-65"), "DD-Mon-YYYY", etc.
- CRITICAL 2-digit year rule for "D-Mon-YY" format: if YY >= 26 → 1900+YY (so 65→1965, 83→1983, 87→1987, 91→1991, 95→1995). If YY <= 25 → 2000+YY (so 03→2003, 10→2010).
- Example: "8-Jun-87" → born June 8, 1987 → age = ${new Date().getFullYear()} - 1987 = ${new Date().getFullYear() - 1987} (adjust -1 if today is before June 8) → age = ${new Date().getFullYear() - 1987 - 1} or ${new Date().getFullYear() - 1987}. This person is NOT over 50.
- Example: "6-Mar-65" → born March 6, 1965 → age = ${new Date().getFullYear()} - 1965 = ${new Date().getFullYear() - 1965} (March 6 > March 4 today, so subtract 1) → age = ${new Date().getFullYear() - 1965 - 1}. This person IS over 50.
- For "members over 50": a person must be born in year ${new Date().getFullYear() - 51} or EARLIER to be over 50. If born in ${new Date().getFullYear() - 50}, they are over 50 only if their birthday has already passed this year.
- SCAN EVERY member record. Do NOT guess or estimate. Count each one.
- If birthday field is missing or null, skip that member for age queries.

RESPONSE RULES (strictly follow these):
- Be extremely concise and professional. No long explanations unless explicitly asked.
- NEVER GUESS OR ESTIMATE. Every number or name must come from the actual data provided. If data is missing, say "No data available."
- For any numeric/count question (e.g. "how many contacts?"), reply ONLY with the number and a link. Example: "6 → **[Church Members →](/ChurchMembers)**"
- For list questions, show the TOTAL count first (e.g. "**12 members**"), then a short bullet list of names. Each name must be a clickable markdown link to their profile: [First Last](/MemberProfile?id=MEMBER_ID). IMPORTANT: If the list has more than 5 items, show ONLY the first 5 names as links, then add "... and X more →" followed by the page link. Never show more than 5 names.
- For summary/analysis questions, respond in 2-3 sentences max.
- NEVER show full tables with many columns unless the user explicitly asks for a detailed table.
- ALWAYS end answers with a relevant page link formatted EXACTLY like this (bold, with arrow): **[Page Name →](/PageName)**
- Page links must always be bold and followed by an arrow "→". Example: **[Church Members →](/ChurchMembers)**, **[Church Events →](/ChurchEvents)**, **[Church Finances →](/ChurchFinances)**
- Speak in the user's language at all times.
- Do not add filler phrases like "Here's a list of them:", "You currently have", "Sure!", etc.
- Do not repeat the question back to the user.
- ACCURACY CHECK: Before responding with any count or list, scan ALL records in the relevant data array. Do not stop early. Count every single matching record.`;

export default function AIAssistant({ mode }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customSystemPrompt, setCustomSystemPrompt] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setIsAdmin(user?.role === 'admin');
    }).catch(() => setIsAdmin(false));
  }, []);

  // Load custom system prompt from DB
  useEffect(() => {
    base44.entities.AppSettings.filter({ key: "ai_system_prompt" }).then(res => {
      if (res && res.length > 0 && res[0].value) {
        setCustomSystemPrompt(res[0].value);
      }
    }).catch(() => {});
  }, []);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("ai_chat_history");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [{ role: "assistant", content: WELCOME[lang] || WELCOME.en }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Save messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("ai_chat_history", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const fetchContext = async () => {
    try {
      const response = await base44.functions.invoke('getChurchContext', {});
      const data = response.data;
      if (mode === "church") {
        // Church mode: only church-related data
        return {
          members: data.members,
          groups: data.groups,
          activities: data.activities,
          visitors: data.visitors,
          staff: data.staff,
          transactions: data.transactions,
          budgets: data.budgets,
          donations: data.donations,
          announcements: data.announcements,
          trainingPrograms: data.trainingPrograms,
          tasks: data.tasks,
          staffTasks: data.staffTasks,
          prayerRequests: data.prayerRequests,
          attendanceRecords: data.attendanceRecords,
          christianOrganizations: data.christianOrganizations,
        };
      } else {
        // CRM mode: only CRM-related data
        return {
          contacts: data.members,
          accounts: data.accounts,
          opportunities: data.opportunities,
          tickets: data.tickets,
          campaigns: data.campaigns,
          activities: data.activities,
          notes: data.notes,
          groups: data.groups,
        };
      }
    } catch {
      return {};
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Fetch relevant data context (filtered by mode)
      const dataContext = await fetchContext();

      // Pre-compute church stats so AI doesn't need to count manually
      let preComputedStats = "";
      if (mode === "church" && dataContext.members) {
        const allMembers = dataContext.members;
        const today = new Date();
        const currentYear = today.getFullYear();

        // Pre-compute marital status breakdown
        const widowed = allMembers.filter(m => m.marital_status === "Widowed");
        const single = allMembers.filter(m => m.marital_status === "Single");
        const married = allMembers.filter(m => m.marital_status === "Married");
        const divorced = allMembers.filter(m => m.marital_status === "Divorced");

        const parseAge = (birthday) => {
          if (!birthday) return null;
          let d = new Date(birthday);
          if (!isNaN(d.getTime())) {
            // new Date("6-Mar-65") may parse wrong in some environments, check year
            if (d.getFullYear() < 1900) return null;
            let age = currentYear - d.getFullYear();
            const m = today.getMonth() - d.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
            return age;
          }
          // Try manual parse for "D-Mon-YY" or "DD-Mon-YYYY"
          const months = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
          const parts = birthday.split(/[-\/\s]/);
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const mon = months[parts[1].toLowerCase().slice(0,3)];
            let yr = parseInt(parts[2]);
            if (!isNaN(yr)) {
              if (yr < 100) yr = yr >= 26 ? 1900 + yr : 2000 + yr;
              if (mon !== undefined) {
                let age = currentYear - yr;
                if (today.getMonth() < mon || (today.getMonth() === mon && today.getDate() < day)) age--;
                return age;
              }
            }
          }
          return null;
        };

        const kids = allMembers.filter(m => m.is_kid === true);
        const adults = allMembers.filter(m => m.is_kid !== true);
        const activeAdults = adults.filter(m => m.status === "active");
        const baptized = adults.filter(m => m.baptism === true);
        const maleMembers = adults.filter(m => m.sex === "M");
        const femaleMembers = adults.filter(m => m.sex === "F");

        const over50 = adults.filter(m => { const a = parseAge(m.birthday); return a !== null && a > 50; });
        const over60 = adults.filter(m => { const a = parseAge(m.birthday); return a !== null && a > 60; });
        const over40 = adults.filter(m => { const a = parseAge(m.birthday); return a !== null && a > 40; });
        const under30 = adults.filter(m => { const a = parseAge(m.birthday); return a !== null && a < 30; });

        preComputedStats = `
PRE-COMPUTED STATS (use these exact numbers, do NOT recount from raw data):
- Total members (ALL contacts): ${allMembers.length}
- Total adults (is_kid=false/null): ${adults.length}
- Active adults: ${activeAdults.length}
- Total kids (is_kid=true): ${kids.length}
- Baptized: ${baptized.length}
- Male members (adults): ${maleMembers.length}
- Female members (adults): ${femaleMembers.length}
- Total groups: ${(dataContext.groups || []).length}
- Adults over 50: ${over50.length} → ${over50.map(m => `${m.first_name} ${m.last_name} (b.${m.birthday}, age ${parseAge(m.birthday)})`).join(", ")}
- Adults over 60: ${over60.length} → ${over60.map(m => `${m.first_name} ${m.last_name} (b.${m.birthday}, age ${parseAge(m.birthday)})`).join(", ")}
- Adults over 40: ${over40.length}
- Adults under 30: ${under30.length}
- Widowed members: ${widowed.length} → ${widowed.map(m => `${m.first_name} ${m.last_name}`).join(", ")}
- Single members: ${single.length} → ${single.map(m => `${m.first_name} ${m.last_name}`).join(", ")}
- Married members: ${married.length} → ${married.map(m => `${m.first_name} ${m.last_name}`).join(", ")}
- Divorced members: ${divorced.length} → ${divorced.map(m => `${m.first_name} ${m.last_name}`).join(", ")}

`;

        // Pre-compute city groups — match any comma-separated part of address
        const cityMap = {};
        allMembers.forEach(m => {
          if (m.address) {
            const parts = m.address.split(",").map(p => p.trim()).filter(Boolean);
            // Add member to every city-like segment (exclude house numbers and short province codes)
            parts.forEach(part => {
              const normalized = part.toLowerCase().replace(/\s+/g, " ").trim();
              // Skip if it looks like a street number or 2-letter province code
              if (!normalized || /^\d/.test(normalized) || normalized.length <= 2) return;
              if (!cityMap[normalized]) cityMap[normalized] = [];
              cityMap[normalized].push({ name: `${m.first_name} ${m.last_name}`, id: m.id });
            });
          }
        });

        const cityLines = Object.entries(cityMap)
          .map(([city, members]) => `- ${city}: ${members.length} members → ${members.map(m => `[${m.name}](/MemberProfile?id=${m.id})`).join(", ")}`)
          .join("\n");

        preComputedStats += `\nPRE-COMPUTED MEMBERS BY CITY (use ONLY these for location queries. Match city name case-insensitively — e.g. "Mississauga", "mississauga", "MISSISSAUGA" are the same. Do NOT re-scan raw data):\n${cityLines}\n`;
      }

      // When in church mode, strip raw members from context to prevent AI from re-scanning
      // and getting wrong results. The pre-computed stats already have everything needed.
      let contextForPrompt = dataContext;
      if (mode === "church" && preComputedStats) {
        const { members: _members, ...restContext } = dataContext;
        contextForPrompt = restContext;
      }
      const contextSummary = JSON.stringify(contextForPrompt, null, 2);

      const conversationHistory = messages
        .slice(-6) // last 6 messages for context
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");

      const langName = lang === "vi" ? "Vietnamese" : lang === "fr" ? "French" : "English";
      const prompt = `${customSystemPrompt || SYSTEM_CONTEXT}

Current mode: ${mode === "church" ? "ChurchCRM" : "EffectiveCRM"}
User language: ${langName}

Available page links (use these for markdown links):
- Contacts → /Contacts
- Accounts → /Accounts
- Pipeline → /Pipeline
- Tickets → /Tickets
- Campaigns → /Campaigns
- Activities → /Activities
- Notes → /Notes
- Groups → /Groups
- Reports → /Reports
- Church Members → /ChurchMembers
- Church Groups → /ChurchGroups
- Church Events → /ChurchEvents
- Church Finances → /ChurchFinances
- Church Messages → /ChurchMessages

${preComputedStats}

Live data from the application:
${contextSummary}

Conversation so far:
${conversationHistory}

User: ${text}

Respond in ${langName}. Follow the RESPONSE RULES strictly. Be ultra-concise.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ " + (lang === "vi" ? "Có lỗi xảy ra. Vui lòng thử lại." : lang === "fr" ? "Une erreur s'est produite." : "An error occurred. Please try again.") }]);
    }
    setLoading(false);
  };

  // Only render for admin users
  if (!isAdmin) return null;

  const isChurch = mode === "church";
  const accentGrad = isChurch
    ? "from-violet-600 to-purple-600"
    : "from-indigo-600 to-blue-600";
  const accentBtn = isChurch
    ? "bg-violet-600 hover:bg-violet-700"
    : "bg-indigo-600 hover:bg-indigo-700";

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br ${accentGrad} shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center text-white`}
          title="AI Assistant"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] h-[560px] max-h-[calc(100vh-80px)] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${accentGrad} px-4 py-3 flex items-center gap-3`}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">AI Assistant</p>
              <p className="text-white/70 text-xs">{isChurch ? "ChurchCRM" : "EffectiveCRM"}</p>
            </div>
            <button
              onClick={() => {
                const newMessages = [{ role: "assistant", content: WELCOME[lang] || WELCOME.en }];
                setMessages(newMessages);
                try {
                  sessionStorage.setItem("ai_chat_history", JSON.stringify(newMessages));
                } catch {}
              }}
              className="text-white/60 hover:text-white p-1 rounded transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${accentGrad} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-slate-800 text-white rounded-tr-sm"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                      components={{
                        table: ({ children }) => <div className="overflow-x-auto"><table className="text-xs border-collapse w-full">{children}</table></div>,
                        th: ({ children }) => <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">{children}</th>,
                        td: ({ children }) => <td className="border border-slate-200 px-2 py-1">{children}</td>,
                        code: ({ inline, children }) => inline
                          ? <code className="bg-slate-100 px-1 rounded text-xs">{children}</code>
                          : <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto"><code>{children}</code></pre>,
                        a: ({ href, children }) => {
                          if (href && href.startsWith("/")) {
                            return <Link to={href} onClick={() => setOpen(false)} className="text-indigo-600 hover:underline">{children}</Link>;
                          }
                          return <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{children}</a>;
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${accentGrad} flex items-center justify-center shrink-0`}>
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={PLACEHOLDER[lang] || PLACEHOLDER.en}
                disabled={loading}
                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 disabled:opacity-50 bg-slate-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`w-9 h-9 rounded-xl ${accentBtn} text-white flex items-center justify-center disabled:opacity-40 transition-all shrink-0`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}