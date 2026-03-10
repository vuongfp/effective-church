import React from "react";
import { Badge } from "@/components/ui/badge";

const presets = {
  // Opportunity stages
  lead: { label: "Lead", className: "bg-slate-100 text-slate-700 border-slate-200" },
  qualified: { label: "Qualified", className: "bg-blue-50 text-blue-700 border-blue-200" },
  proposal: { label: "Proposal", className: "bg-violet-50 text-violet-700 border-violet-200" },
  negotiation: { label: "Negotiation", className: "bg-amber-50 text-amber-700 border-amber-200" },
  closed_won: { label: "Closed Won", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed_lost: { label: "Closed Lost", className: "bg-rose-50 text-rose-700 border-rose-200" },
  // Ticket status
  open: { label: "Open", className: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-700 border-amber-200" },
  waiting: { label: "Waiting", className: "bg-violet-50 text-violet-700 border-violet-200" },
  resolved: { label: "Resolved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-600 border-slate-200" },
  // Priority
  low: { label: "Low", className: "bg-slate-100 text-slate-600 border-slate-200" },
  medium: { label: "Medium", className: "bg-amber-50 text-amber-700 border-amber-200" },
  high: { label: "High", className: "bg-orange-50 text-orange-700 border-orange-200" },
  urgent: { label: "Urgent", className: "bg-rose-50 text-rose-700 border-rose-200" },
  // Campaign
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600 border-slate-200" },
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Completed", className: "bg-blue-50 text-blue-700 border-blue-200" },
  // Account type
  prospect: { label: "Prospect", className: "bg-blue-50 text-blue-700 border-blue-200" },
  customer: { label: "Customer", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  partner: { label: "Partner", className: "bg-violet-50 text-violet-700 border-violet-200" },
  former_customer: { label: "Former", className: "bg-slate-100 text-slate-600 border-slate-200" },
  inactive: { label: "Inactive", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function StatusBadge({ status, customLabel }) {
  const preset = presets[status] || { label: status, className: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <Badge variant="outline" className={`text-xs font-medium border ${preset.className}`}>
      {customLabel || preset.label}
    </Badge>
  );
}