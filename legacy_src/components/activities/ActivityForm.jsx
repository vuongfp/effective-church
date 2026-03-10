import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormModal from "../shared/FormModal";

export default function ActivityForm({ open, onOpenChange, activity, onSaved }) {
  const [form, setForm] = useState({ type: "call", subject: "", description: "", contact_id: "", contact_name: "", due_date: "", completed: false });
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => base44.entities.Contact.list() });

  useEffect(() => {
    if (activity) setForm({ ...activity });
    else setForm({ type: "call", subject: "", description: "", contact_id: "", contact_name: "", due_date: "", completed: false });
  }, [activity, open]);

  const mutation = useMutation({
    mutationFn: (data) => activity ? base44.entities.Activity.update(activity.id, data) : base44.entities.Activity.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["activities"] }); onSaved(); },
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={activity ? "Edit Activity" : "Log Activity"} onSubmit={() => mutation.mutate(form)} isSubmitting={mutation.isPending}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select value={form.type} onValueChange={v => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="call">📞 Call</SelectItem>
              <SelectItem value="email">📧 Email</SelectItem>
              <SelectItem value="meeting">📅 Meeting</SelectItem>
              <SelectItem value="note">📝 Note</SelectItem>
              <SelectItem value="task">✅ Task</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Contact</Label>
          <Select value={form.contact_id || "none"} onValueChange={v => { set("contact_id", v === "none" ? "" : v); const c = contacts.find(c => c.id === v); if (c) set("contact_name", `${c.first_name} ${c.last_name}`); }}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No contact</SelectItem>
              {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Subject *</Label>
        <Input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Called to discuss renewal..." />
      </div>
      {form.type === "task" && (
        <div>
          <Label>Due Date</Label>
          <Input type="date" value={form.due_date} onChange={e => set("due_date", e.target.value)} />
        </div>
      )}
      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Add details..." />
      </div>
    </FormModal>
  );
}