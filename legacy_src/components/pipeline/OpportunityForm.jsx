import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormModal from "../shared/FormModal";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];
const SOURCES = ["website", "referral", "cold_call", "event", "social_media", "other"];

export default function OpportunityForm({ open, onOpenChange, opportunity, initialStage, onSaved }) {
  const [form, setForm] = useState({
    title: "", account_id: "", account_name: "", contact_id: "", stage: "lead", value: "", probability: "", expected_close_date: "", notes: "", source: "", assigned_to: ""
  });
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => base44.entities.Contact.list() });

  useEffect(() => {
    if (opportunity) {
      setForm({ ...opportunity, value: opportunity.value || "", probability: opportunity.probability || "" });
    } else {
      setForm({ title: "", account_id: "", account_name: "", contact_id: "", stage: initialStage || "lead", value: "", probability: "", expected_close_date: "", notes: "", source: "", assigned_to: "" });
    }
  }, [opportunity, open, initialStage]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, value: data.value ? Number(data.value) : null, probability: data.probability ? Number(data.probability) : null };
      return opportunity ? base44.entities.Opportunity.update(opportunity.id, payload) : base44.entities.Opportunity.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      onSaved();
    },
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={opportunity ? "Edit Deal" : "New Deal"} onSubmit={() => mutation.mutate(form)} isSubmitting={mutation.isPending}>
      <div>
        <Label>Deal Title *</Label>
        <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Enterprise License Deal" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Account</Label>
          <Select value={form.account_id || "none"} onValueChange={v => { set("account_id", v === "none" ? "" : v); const a = accounts.find(a => a.id === v); if (a) set("account_name", a.name); }}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No account</SelectItem>
              {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Contact</Label>
          <Select value={form.contact_id || "none"} onValueChange={v => set("contact_id", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No contact</SelectItem>
              {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Stage</Label>
          <Select value={form.stage} onValueChange={v => set("stage", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STAGES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Source</Label>
          <Select value={form.source || "none"} onValueChange={v => set("source", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select source</SelectItem>
              {SOURCES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Value ($)</Label>
          <Input type="number" value={form.value} onChange={e => set("value", e.target.value)} placeholder="50000" />
        </div>
        <div>
          <Label>Probability (%)</Label>
          <Input type="number" min="0" max="100" value={form.probability} onChange={e => set("probability", e.target.value)} placeholder="75" />
        </div>
        <div>
          <Label>Expected Close</Label>
          <Input type="date" value={form.expected_close_date} onChange={e => set("expected_close_date", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} />
      </div>
    </FormModal>
  );
}