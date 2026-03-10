import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormModal from "../shared/FormModal";

export default function TicketForm({ open, onOpenChange, ticket, onSaved }) {
  const [form, setForm] = useState({
    subject: "", description: "", contact_id: "", contact_name: "", account_name: "", priority: "medium", status: "open", category: "general", assigned_to: "", resolution_notes: ""
  });
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => base44.entities.Contact.list() });

  useEffect(() => {
    if (ticket) setForm({ ...ticket });
    else setForm({ subject: "", description: "", contact_id: "", contact_name: "", account_name: "", priority: "medium", status: "open", category: "general", assigned_to: "", resolution_notes: "" });
  }, [ticket, open]);

  const mutation = useMutation({
    mutationFn: (data) => ticket ? base44.entities.Ticket.update(ticket.id, data) : base44.entities.Ticket.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tickets"] }); onSaved(); },
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={ticket ? "Edit Ticket" : "New Ticket"} onSubmit={() => mutation.mutate(form)} isSubmitting={mutation.isPending}>
      <div><Label>Subject *</Label><Input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Login issue" /></div>
      <div><Label>Description *</Label><Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Describe the issue..." /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Contact</Label>
          <Select value={form.contact_id || "none"} onValueChange={v => { set("contact_id", v === "none" ? "" : v); const c = contacts.find(c => c.id === v); if (c) { set("contact_name", `${c.first_name} ${c.last_name}`); set("account_name", c.company || ""); } }}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No contact</SelectItem>
              {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Category</Label>
          <Select value={form.category} onValueChange={v => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="feature_request">Feature Request</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Priority</Label>
          <Select value={form.priority} onValueChange={v => set("priority", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Status</Label>
          <Select value={form.status} onValueChange={v => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {(form.status === "resolved" || form.status === "closed") && (
        <div><Label>Resolution Notes</Label><Textarea value={form.resolution_notes} onChange={e => set("resolution_notes", e.target.value)} rows={2} placeholder="How was this resolved?" /></div>
      )}
    </FormModal>
  );
}