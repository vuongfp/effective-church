import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, TrendingUp, TicketCheck, Megaphone, DollarSign } from "lucide-react";
import StatCard from "../components/shared/StatCard";
import DashboardPipeline from "../components/dashboard/DashboardPipeline";
import RecentActivities from "../components/dashboard/RecentActivities";
import UpcomingTasks from "../components/dashboard/UpcomingTasks";
import { useLang } from "../components/i18n/LanguageContext";
import { t } from "../components/i18n/translations";

export default function Dashboard() {
  const { lang } = useLang();
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => base44.entities.Contact.list() });
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
  const { data: opportunities = [] } = useQuery({ queryKey: ["opportunities"], queryFn: () => base44.entities.Opportunity.list() });
  const { data: tickets = [] } = useQuery({ queryKey: ["tickets"], queryFn: () => base44.entities.Ticket.list() });
  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns"], queryFn: () => base44.entities.Campaign.list() });
  const { data: activities = [] } = useQuery({ queryKey: ["activities"], queryFn: () => base44.entities.Activity.list("-created_date", 10) });

  const totalPipelineValue = opportunities
    .filter(o => !["closed_won", "closed_lost"].includes(o.stage))
    .reduce((sum, o) => sum + (o.value || 0), 0);

  const openTickets = tickets.filter(t => ["open", "in_progress"].includes(t.status)).length;
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label={t("Contacts", lang)} value={contacts.length} icon={Users} color="indigo" />
        <StatCard label={t("Accounts", lang)} value={accounts.length} icon={Building2} color="violet" />
        <StatCard label={t("Open Deals", lang)} value={opportunities.filter(o => !["closed_won", "closed_lost"].includes(o.stage)).length} icon={TrendingUp} color="emerald" />
        <StatCard label={t("Pipeline Value", lang)} value={`$${(totalPipelineValue / 1000).toFixed(0)}k`} icon={DollarSign} color="amber" />
        <StatCard label={t("Open Tickets", lang)} value={openTickets} icon={TicketCheck} color="rose" />
        <StatCard label={t("Active Campaigns", lang)} value={activeCampaigns} icon={Megaphone} color="sky" />
      </div>

      {/* Pipeline overview */}
      <DashboardPipeline opportunities={opportunities} />

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivities activities={activities} />
        <UpcomingTasks activities={activities} />
      </div>
    </div>
  );
}