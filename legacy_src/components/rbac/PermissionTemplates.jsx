import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const PERMISSION_TEMPLATES = {
  admin: {
    name: "Administrator",
    description: "Full access to all pages and entities",
    icon: "🔐",
  },
  pastor: {
    name: "Pastor",
    description: "Pastoral care, members, events, and reports",
    icon: "⛪",
  },
  staff: {
    name: "Staff",
    description: "Members, groups, tasks, and activities",
    icon: "👔",
  },
  finance: {
    name: "Finance Team",
    description: "Finance, budgets, and transaction management",
    icon: "💰",
  },
  youth: {
    name: "Youth Leader",
    description: "Youth events, kids church, and training",
    icon: "🎯",
  },
  viewer: {
    name: "Viewer",
    description: "Read-only access to most content",
    icon: "👁️",
  },
};

export default function PermissionTemplates({ onApplyTemplate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const { data: permissions = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => base44.entities.Permission.list(),
  });

  const getTemplatePermissions = (templateKey) => {
    const templates = {
      admin: permissions.map(p => p.id), // All permissions
      pastor: permissions.filter(p =>
        ["Members", "Pastoral Care", "Events", "Reports", "Finance"].includes(p.category)
      ).map(p => p.id),
      staff: permissions.filter(p =>
        ["Members", "Groups", "Events", "Tasks", "Activities"].includes(p.category)
      ).map(p => p.id),
      finance: permissions.filter(p =>
        p.category === "Finance"
      ).map(p => p.id),
      youth: permissions.filter(p =>
        ["Youth", "Kids", "Training", "Events"].includes(p.category)
      ).map(p => p.id),
      viewer: permissions.filter(p =>
        p.action === "view"
      ).map(p => p.id),
    };
    return templates[templateKey] || [];
  };

  const handleApplyTemplate = (templateKey) => {
    const templatePerms = getTemplatePermissions(templateKey);
    onApplyTemplate(templatePerms);
    setSelectedTemplate(templateKey);
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {Object.entries(PERMISSION_TEMPLATES).map(([key, template]) => (
        <button
          key={key}
          onClick={() => handleApplyTemplate(key)}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            selectedTemplate === key
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-200 hover:border-indigo-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{template.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{template.name}</h3>
              <p className="text-sm text-slate-600">{template.description}</p>
            </div>
            {selectedTemplate === key && (
              <div className="text-indigo-600 font-medium text-sm">Applied</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}