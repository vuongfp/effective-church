import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormModal from "../shared/FormModal";

export default function NoteForm({ open, onOpenChange, note, onSaved }) {
  const [form, setForm] = useState({ content: "", entity_type: "contact", entity_id: "", entity_name: "", pinned: false });
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => base44.entities.Contact.list() });
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
  const { data: opportunities = [] } = useQuery({ queryKey: ["opportunities"], queryFn: () => base44.entities.Opportunity.list() });
  const { data: tickets = [] } = useQuery({ queryKey: ["tickets"], queryFn: () => base44.entities.Ticket.list() });

  useEffect(() => {
    if (note) setForm({ ...note });
    else setForm({ content: "", entity_type: "contact", entity_id: "", entity_name: "", pinned: false });
  }, [note, open]);

  const mutation = useMutation({
    mutationFn: (data) => note ? base44.entities.Note.update(note.id, data) : base44.entities.Note.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notes"] }); onSaved(); },
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const entityOptions = {
    contact: contacts.map(c => ({ id: c.id, name: `${c.first_name} ${c.last_name}` })),
    account: accounts.map(a => ({ id: a.id, name: a.name })),
    opportunity: opportunities.map(o => ({ id: o.id, name: o.title })),
    ticket: tickets.map(t => ({ id: t.id, name: t.subject })),
  };

  const currentOptions = entityOptions[form.entity_type] || [];

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={note ? "Edit Note" : "Add Note"} onSubmit={() => mutation.mutate(form)} isSubmitting={mutation.isPending}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Related To</Label>
          <Select value={form.entity_type} onValueChange={v => { set("entity_type", v); set("entity_id", ""); set("entity_name", ""); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="contact">Contact</SelectItem>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="opportunity">Opportunity</SelectItem>
              <SelectItem value="ticket">Ticket</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Select</Label>
          <Select value={form.entity_id || "none"} onValueChange={v => { set("entity_id", v === "none" ? "" : v); const opt = currentOptions.find(o => o.id === v); if (opt) set("entity_name", opt.name); }}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select...</SelectItem>
              {currentOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Note Content *</Label>
        <Textarea value={form.content} onChange={e => set("content", e.target.value)} rows={5} placeholder="Write your note here..." />
      </div>
    </FormModal>
  );
}