import React, { useState } from "react";
import {
  LayoutDashboard, Users, Tag, Calendar, DollarSign, MessageSquare,
  BarChart3, TicketCheck, Briefcase, Building2, Megaphone, ChevronDown,
  ChevronRight, BookOpen, CheckCircle, ArrowRight, Map, Upload, Download,
  Bell, UserCircle, Globe, Heart
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

const SECTIONS = [
  {
    id: "overview",
    icon: BookOpen,
    color: "violet",
    title: "System Overview",
    summary: "Church CRM is a comprehensive church management platform to help you manage members, groups, events, finances, and communications — all in one place.",
    content: [
      {
        subtitle: "What is Church CRM?",
        text: "Church CRM is built specifically for church communities. It provides a unified platform for pastoral work, member management, and organizational coordination. You can access all features from the sidebar navigation."
      },
      {
        subtitle: "Key Principles",
        bullets: [
          "All data is centralized — members, groups, events, finances, and messages are connected.",
          "Multi-language support: English, French, and Vietnamese.",
          "Works on desktop and mobile with responsive design.",
          "Real-time data updates across all modules.",
          "Role-based access control for team collaboration."
        ]
      }
    ]
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    color: "indigo",
    title: "Dashboard",
    summary: "The central hub showing live statistics, attendance trends, upcoming events, and recent activity.",
    content: [
      {
        subtitle: "What you see",
        bullets: [
          "Total members, new converts (last 30 days), number of groups, upcoming events.",
          "Average weekly attendance and total tithes/offerings for the current year.",
          "Attendance trend chart and expense distribution pie chart.",
          "Church calendar widget with monthly/weekly views.",
          "List of upcoming events with Google Calendar integration.",
          "Recent converts list."
        ]
      },
      {
        subtitle: "Workflow",
        bullets: [
          "Use the dashboard as your starting point each day.",
          "Click upcoming events to open them, or add to Google Calendar with the '+ GCal' button.",
          "Stats auto-update as you add members, events, or attendance records."
        ]
      }
    ]
  },
  {
    id: "members",
    icon: Users,
    color: "violet",
    title: "Members",
    summary: "Manage your full church membership directory with rich profiles, filtering, CSV import/export, and a geographic map view.",
    content: [
      {
        subtitle: "Member Fields",
        bullets: [
          "Personal: Name, Gender, Birthday, Marital Status, Profession.",
          "Contact: Email, Phone, Address (with GPS coordinates for map view).",
          "Church: Baptism status, Member Since date, Last Attendance, Status (Active / Inactive / Deceased / Transferred).",
          "Groups: Assign a member to one or more groups/ministries.",
          "Notes: Free-text notes for pastoral care."
        ]
      },
      {
        subtitle: "Filtering & Sorting",
        bullets: [
          "Search by name, email, phone, or address.",
          "Filter by Gender, Marital Status, Baptism status, and Activity Status.",
          "Click any column header to sort ascending/descending."
        ]
      },
      {
        subtitle: "Views",
        bullets: [
          "Table View: Full list with all columns.",
          "Map View: See member locations on an interactive map. Click a pin to view details or update GPS coordinates."
        ]
      },
      {
        subtitle: "Import / Export",
        bullets: [
          "Export CSV: Download the filtered list as a spreadsheet.",
          "Import CSV: Bulk-upload members from a CSV file."
        ]
      },
      {
        subtitle: "Member Profile",
        bullets: [
          "Click a member's name to open their full profile page.",
          "Profile shows contact info, group memberships, notes, and a timeline of all related activities.",
          "Click Edit to update their information."
        ]
      },
      {
        subtitle: "Birthday Notifications",
        text: "A notification banner at the top of the Members page highlights members whose birthday or church anniversary falls within the next 14 days."
      }
    ]
  },
  {
    id: "groups",
    icon: Tag,
    color: "indigo",
    title: "Groups / Cells",
    summary: "Organize members into ministry groups, cell groups, or any custom category.",
    content: [
      {
        subtitle: "Creating a Group",
        bullets: [
          "Click 'New Group', give it a name, description, type, and a color tag.",
          "Types: Segment, Industry, Region, VIP, Lead Source, Custom."
        ]
      },
      {
        subtitle: "Managing Members",
        bullets: [
          "Add members to a group from the Member Form (group picker field).",
          "The group card shows the current member count.",
          "Click a group card to edit its details."
        ]
      }
    ]
  },
  {
    id: "events",
    icon: Calendar,
    color: "emerald",
    title: "Events & Services",
    summary: "Track all church events, Sunday services, outreach activities, and meetings.",
    content: [
      {
        subtitle: "Adding an Event",
        bullets: [
          "Click 'Add Event', fill in subject, description, date, location, responsible person.",
          "Select an event category: Evangelism, Spiritual Enhancement, Social Work, Worship, Kids, Training, General.",
          "Optionally link the event to a contact and add expected attendance."
        ]
      },
      {
        subtitle: "Event Workflow",
        bullets: [
          "Events appear on the Dashboard calendar widget.",
          "Toggle the circle icon to mark an event as completed.",
          "Add events to Google Calendar directly from the Dashboard.",
          "Filter by category in Church Reports → Events."
        ]
      }
    ]
  },
  {
    id: "attendance",
    icon: BarChart3,
    color: "amber",
    title: "Attendance & Tithes",
    summary: "Record weekly Sunday attendance and tithes to track growth trends over time.",
    content: [
      {
        subtitle: "Recording Attendance",
        bullets: [
          "Go to Church Finances to add attendance records for each Sunday.",
          "Each record includes: Date, Number of Attendees, and Tithe/Offering amount in CAD.",
          "Data flows automatically into the Dashboard stats and charts."
        ]
      },
      {
        subtitle: "Dashboard Integration",
        bullets: [
          "Weekly average attendance displays on the Dashboard.",
          "Year-to-date tithe total shows on the Dashboard.",
          "Attendance trend charts and offering breakdown visible in Church Finances page.",
          "Historical 2025 financial data and budget comparisons available."
        ]
      }
    ]
  },
  {
    id: "finances",
    icon: DollarSign,
    color: "sky",
    title: "Finances",
    summary: "View the church budget breakdown, income vs. expenses, and year-over-year financial performance.",
    content: [
      {
        subtitle: "Budget Overview",
        bullets: [
          "See planned vs. actual amounts for Administration, Ministries, and Special budget lines.",
          "Summary cards show total income, expenses, net balance, and investment fund.",
          "Attendance chart embedded to correlate giving with attendance."
        ]
      },
      {
        subtitle: "Budget Sections",
        bullets: [
          "Administration: Salary, rent, utilities, insurance, office supplies, travel.",
          "Ministries: Youth, worship, outreach, discipleship, children.",
          "Special: Missions, building fund, emergency reserve."
        ]
      }
    ]
  },
  {
    id: "visitors",
    icon: Globe,
    color: "rose",
    title: "Visitor Tracking",
    summary: "Track church visitors, their engagement level, and conversion to members.",
    content: [
      {
        subtitle: "Visitor Statuses",
        bullets: [
          "First Time: New visitor to the church.",
          "Returning: Visited more than once.",
          "Converted Member: Joined as an official member."
        ]
      },
      {
        subtitle: "Visitor Information",
        bullets: [
          "Name, Email, Phone, Address.",
          "First visit date and most recent visit date.",
          "Visit count (tracks frequency of attendance).",
          "Personal notes and interests."
        ]
      },
      {
        subtitle: "Workflow",
        bullets: [
          "Click 'Record Visit' to update last visit date and increment visit count.",
          "Filter visitors by status and date (Today, This Week, This Month).",
          "Search for visitors by name or email.",
          "Edit visitor details or delete records as needed."
        ]
      },
      {
        subtitle: "Integration",
        text: "Visitor data integrates with member management. Converted visitors can be promoted to full member status in the Members page."
      }
    ]
  },
  {
    id: "messages",
    icon: MessageSquare,
    color: "violet",
    title: "Messages",
    summary: "Send bulk emails or SMS to your congregation or specific groups.",
    content: [
      {
        subtitle: "Sending a Message",
        bullets: [
          "Choose channel: Email or SMS.",
          "Select recipients: All members, or a specific group.",
          "Write your subject and body, then click Send.",
          "SMS messages show a 160-character limit counter."
        ]
      },
      {
        subtitle: "Message History",
        text: "All sent messages are logged and viewable in the Message History section at the bottom of the page."
      }
    ]
  },
  {
    id: "tasks",
    icon: TicketCheck,
    color: "rose",
    title: "Operational Tasks & Care",
    summary: "Manage administrative tasks, prayer requests, and pastoral care activities in one place.",
    content: [
      {
        subtitle: "Three-Column Dashboard",
        bullets: [
          "Prayer Requests (left): Track spiritual prayer needs with status tracking.",
          "Care Activities (center): Record pastoral visits, phone calls, counseling, and prayer interventions.",
          "Tasks (right): Administrative and pastoral tasks with categories and priorities."
        ]
      },
      {
        subtitle: "Tasks",
        bullets: [
          "Title, Description, Category (Administration / Pastoral Care / Social Responsibility).",
          "Priority: Low, Medium, High, Urgent.",
          "Status: Pending → In Progress → Done.",
          "Due Date for each task."
        ]
      },
      {
        subtitle: "Prayer Requests",
        bullets: [
          "Link to a contact and record their prayer need.",
          "Status: Open → In Progress → Answered → Closed.",
          "Can mark requests as confidential.",
          "Track prayer request updates over time."
        ]
      },
      {
        subtitle: "Care Activities",
        bullets: [
          "Record pastoral care interactions: visits, phone calls, counseling, prayer meetings, emails.",
          "Link to a contact and add detailed notes.",
          "Track activity date and type.",
          "Helps maintain pastoral care history for each member."
        ]
      }
    ]
  },
  {
    id: "education",
    icon: Briefcase,
    color: "amber",
    title: "Education / Career",
    summary: "Manage discipleship training programs and track member enrollment and completion.",
    content: [
      {
        subtitle: "Training Programs",
        bullets: [
          "Create programs with name, description, category, dates, instructor, and max participants.",
          "Categories: Discipleship, Leadership, Ministry, Vocational, Youth, Other.",
          "Track enrolled and completed participant lists."
        ]
      },
      {
        subtitle: "Statistics",
        bullets: [
          "Total programs, ongoing vs. completed counts.",
          "Members by profession breakdown chart.",
          "Per-program enrollment and completion rates."
        ]
      }
    ]
  },
  {
    id: "kids",
    icon: Users,
    color: "pink",
    title: "Kid Church",
    summary: "A dedicated module for managing children's ministry members and activities.",
    content: [
      {
        subtitle: "Children Registry",
        bullets: [
          "Members flagged as 'Is Kid' appear in the Kid Church module.",
          "View age distribution and gender breakdown charts.",
          "Full children list with age and contact details."
        ]
      },
      {
        subtitle: "Kid Activities",
        text: "Activities linked to kids (via attendee IDs) appear in the Kid Activities timeline, keeping children's ministry organized separately."
      }
    ]
  },
  {
    id: "organizations",
    icon: Building2,
    color: "indigo",
    title: "Christian Organizations",
    summary: "Maintain a directory of partner churches, missions, and Christian organizations.",
    content: [
      {
        subtitle: "Organization Fields",
        bullets: [
          "Name, Function (Evangelism, Education, Social Work, Worship, Youth, Missions, Media, Other).",
          "Website, Phone, Email, Address, Contact Person.",
          "Relationship type: Partner, Affiliated, Supported, Supporting, Other.",
          "Notes."
        ]
      },
      {
        subtitle: "Workflow",
        text: "Filter organizations by function. Click any card to edit. Use as a reference directory for inter-church partnerships."
      }
    ]
  },
  {
    id: "announcements",
    icon: Megaphone,
    color: "orange",
    title: "Communication & Announcements",
    summary: "Post internal announcements for members, leaders, or specific groups.",
    content: [
      {
        subtitle: "Creating an Announcement",
        bullets: [
          "Title, Content, Published Date.",
          "Target: All, Members, Leaders, Kids, or a Specific Group.",
          "Channel: Internal, Email, SMS, or WhatsApp.",
          "Pin important announcements to keep them at the top."
        ]
      }
    ]
  },
  {
    id: "reports",
    icon: BarChart3,
    color: "violet",
    title: "Church Reports",
    summary: "In-depth reports for attendance, members, finances, events, and training programs — all exportable to CSV.",
    content: [
      {
        subtitle: "Report Types",
        bullets: [
          "Attendance: Weekly/monthly trends, year-over-year, detailed table.",
          "Members: Status breakdown, profession chart, filterable member list.",
          "Finance: Offering trends, monthly and yearly totals.",
          "Events: Category distribution, event list with date filters.",
          "Training: Program summary, enrollment/completion rates."
        ]
      },
      {
        subtitle: "Export",
        text: "Each report has a 'Download CSV' button to export the filtered data for use in Excel or other tools."
      }
    ]
  }
];

const COLOR_MAP = {
  violet: { icon: "bg-violet-100 text-violet-600", badge: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  indigo: { icon: "bg-indigo-100 text-indigo-600", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  emerald: { icon: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  amber: { icon: "bg-amber-100 text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  sky: { icon: "bg-sky-100 text-sky-600", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  rose: { icon: "bg-rose-100 text-rose-600", badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  red: { icon: "bg-red-100 text-red-600", badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  pink: { icon: "bg-pink-100 text-pink-600", badge: "bg-pink-50 text-pink-700 border-pink-200", dot: "bg-pink-500" },
  orange: { icon: "bg-orange-100 text-orange-600", badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
};

function Section({ section }) {
  const [open, setOpen] = useState(false);
  const c = COLOR_MAP[section.color] || COLOR_MAP.violet;
  const Icon = section.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{section.title}</p>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{section.summary}</p>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-6 border-t border-slate-100 pt-4 space-y-4">
          <p className="text-sm text-slate-600">{section.summary}</p>
          {section.content.map((block, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                {block.subtitle}
              </p>
              {block.text && <p className="text-sm text-slate-600 ml-4">{block.text}</p>}
              {block.bullets && (
                <ul className="ml-4 space-y-1.5">
                  {block.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UserGuide() {
  const { lang } = useLang();
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("User Guide", lang)}</h1>
              <p className="text-white/80 text-sm">{t("Church CRM — Complete Feature Reference", lang)}</p>
            </div>
          </div>
          <p className="text-white/90 text-sm leading-relaxed">
            {lang === "vi" ? "Hướng dẫn này bao gồm mọi mô-đun trong Church CRM. Nhấp vào bất kỳ phần nào để mở rộng mô tả chi tiết và quy trình công việc của nó. Sử dụng thanh điều hướng bên để nhảy đến bất kỳ trang nào." : lang === "fr" ? "Ce guide couvre tous les modules de Church CRM. Cliquez sur n'importe quelle section pour développer sa description détaillée et son flux de travail. Utilisez la barre de navigation latérale pour accéder à n'importe quelle page." : "This guide covers every module in Church CRM. Click any section to expand its detailed description and workflow. Use the navigation sidebar to jump to any page."}
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{lang === "vi" ? "Điều hướng nhanh" : lang === "fr" ? "Navigation rapide" : "Quick Navigation"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              const c = COLOR_MAP[s.color] || COLOR_MAP.violet;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50 transition-colors text-sm text-slate-700 font-medium"
                >
                  <Icon className={`w-4 h-4 ${c.icon.split(" ")[1]}`} />
                  {s.title}
                </a>
              );
            })}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{lang === "vi" ? "Tất cả tính năng" : lang === "fr" ? "Toutes les fonctionnalités" : "All Features"}</h2>
          {SECTIONS.map(s => (
            <div key={s.id} id={s.id}>
              <Section section={s} />
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="rounded-xl bg-violet-50 border border-violet-200 p-5 flex gap-3 items-start">
          <Globe className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-violet-800">{lang === "vi" ? "Hỗ trợ ngôn ngữ" : lang === "fr" ? "Support linguistique" : "Language Support"}</p>
            <p className="text-sm text-violet-700 mt-0.5">
              {lang === "vi" ? "Church CRM hỗ trợ tiếng Anh, Pháp và Việt. Thay đổi ngôn ngữ bất kỳ lúc nào bằng cách sử dụng biểu tượng trái đất ở cuối thanh bên." : lang === "fr" ? "Church CRM supporte l'anglais, le français et le vietnamien. Changez la langue à tout moment en utilisant l'icône du monde en bas de la barre latérale." : "Church CRM supports English, French, and Vietnamese. Change the language at any time using the globe icon at the bottom of the sidebar."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}