import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

const COLORS = ["#818cf8", "#34d399", "#fbbf24", "#f87171", "#60a5fa", "#a78bfa", "#f472b6", "#fb923c"];

export default function Reports() {
  const { lang } = useLang();
  const { data: contacts = [], isLoading: loadingC } = useQuery({ queryKey: ["contacts"], queryFn: () => base44.entities.Contact.list() });
  const { data: accounts = [], isLoading: loadingA } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
  const { data: opportunities = [], isLoading: loadingO } = useQuery({ queryKey: ["opportunities"], queryFn: () => base44.entities.Opportunity.list() });
  const { data: tickets = [], isLoading: loadingT } = useQuery({ queryKey: ["tickets"], queryFn: () => base44.entities.Ticket.list() });
  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns"], queryFn: () => base44.entities.Campaign.list() });

  const isLoading = loadingC || loadingA || loadingO || loadingT;

  // Account types distribution
  const accountTypes = ["prospect", "customer", "partner", "former_customer"].map(type => ({
    name: type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    value: accounts.filter(a => a.type === type).length,
  })).filter(d => d.value > 0);

  // Opportunities by stage
  const stageData = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"].map(stage => ({
    name: stage.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    count: opportunities.filter(o => o.stage === stage).length,
    value: opportunities.filter(o => o.stage === stage).reduce((s, o) => s + (o.value || 0), 0),
  }));

  // Tickets by priority
  const ticketPriority = ["low", "medium", "high", "urgent"].map(p => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    value: tickets.filter(t => t.priority === p).length,
  })).filter(d => d.value > 0);

  // Campaign performance
  const campaignData = campaigns.map(c => ({
    name: c.name?.substring(0, 15) || "Unnamed",
    leads: c.leads_generated || 0,
    conversions: c.conversions || 0,
  }));

  // Win rate
  const closedWon = opportunities.filter(o => o.stage === "closed_won").length;
  const closedLost = opportunities.filter(o => o.stage === "closed_lost").length;
  const winRate = closedWon + closedLost > 0 ? ((closedWon / (closedWon + closedLost)) * 100).toFixed(1) : 0;

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-3xl font-bold text-indigo-600">{winRate}%</p>
          <p className="text-sm text-slate-500 mt-1">{t("Win Rate", lang)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-3xl font-bold text-emerald-600">${opportunities.filter(o => o.stage === "closed_won").reduce((s, o) => s + (o.value || 0), 0).toLocaleString()}</p>
          <p className="text-sm text-slate-500 mt-1">{t("Total Won", lang)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-3xl font-bold text-amber-600">{tickets.filter(t => t.status === "open").length}</p>
          <p className="text-sm text-slate-500 mt-1">{t("Open Tickets (reports)", lang)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-3xl font-bold text-violet-600">{campaigns.filter(c => c.status === "active").length}</p>
          <p className="text-sm text-slate-500 mt-1">{t("Active Campaigns (reports)", lang)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by stage */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{t("Pipeline by Stage", lang)}</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Legend />
                <Bar dataKey="count" name="Deals" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Account distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{t("Account Types", lang)}</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={accountTypes} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {accountTypes.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket priorities */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{t("Tickets by Priority", lang)}</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ticketPriority} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {ticketPriority.map((_, idx) => <Cell key={idx} fill={["#94a3b8", "#fbbf24", "#fb923c", "#ef4444"][idx]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{t("Campaign Performance", lang)}</h3>
          <div className="h-[280px]">
            {campaignData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <Legend />
                  <Bar dataKey="leads" name="Leads" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" name="Conversions" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400 text-center py-20">{t("No campaign data yet", lang)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}