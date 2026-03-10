import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormModal from "../shared/FormModal";

const TYPES = ["email", "event", "social_media", "advertising", "webinar", "other"];

export default function CampaignForm({ open, onOpenChange, campaign, onSaved }) {
  const [form, setForm] = useState({
    name: "", type: "email", status: "draft", start_date: "", end_date: "", budget: "", leads_generated: 0, conversions: 0, description: "", target_audience: ""
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (campaign) setForm({ ...campaign, budget: campaign.budget || "" });
    else setForm({ name: "", type: "email", status: "draft", start_date: "", end_date: "", budget: "", leads_generated: 0, conversions: 0, description: "", target_audience: "" });
  }, [campaign, open]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, budget: data.budget ? Number(data.budget) : null, leads_generated: Number(data.leads_generated) || 0, conversions: Number(data.conversions) || 0 };
      return campaign ? base44.entities.Campaign.update(campaign.id, payload) : base44.entities.Campaign.create(payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["campaigns"] }); onSaved(); },
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={campaign ? "Edit Campaign" : "New Campaign"} onSubmit={() => mutation.mutate(form)} isSubmitting={mutation.isPending}>
      <div><Label>Campaign Name *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Spring Email Blast" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Type</Label>
          <Select value={form.type} onValueChange={v => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Status</Label>
          <Select value={form.status} onValueChange={v => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} /></div>
        <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Budget ($)</Label><Input type="number" value={form.budget} onChange={e => set("budget", e.target.value)} placeholder="5000" /></div>
        <div><Label>Leads</Label><Input type="number" value={form.leads_generated} onChange={e => set("leads_generated", e.target.value)} /></div>
        <div><Label>Conversions</Label><Input type="number" value={form.conversions} onChange={e => set("conversions", e.target.value)} /></div>
      </div>
      <div><Label>Target Audience</Label><Input value={form.target_audience} onChange={e => set("target_audience", e.target.value)} placeholder="Tech decision makers" /></div>
      <div><Label>Description</Label><Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} /></div>
    </FormModal>
  );
}