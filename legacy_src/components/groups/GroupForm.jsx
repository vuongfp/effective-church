import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormModal from "../shared/FormModal";

export default function GroupForm({ open, onOpenChange, group, groupColors, onSaved }) {
  const [form, setForm] = useState({ name: "", description: "", type: "custom", color: "#818cf8" });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (group) setForm({ name: group.name, description: group.description || "", type: group.type || "custom", color: group.color || "#818cf8" });
    else setForm({ name: "", description: "", type: "custom", color: "#818cf8" });
  }, [group, open]);

  const mutation = useMutation({
    mutationFn: (data) => group ? base44.entities.Group.update(group.id, data) : base44.entities.Group.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["groups"] }); onSaved(); },
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={group ? "Edit Group" : "New Group"} onSubmit={() => mutation.mutate(form)} isSubmitting={mutation.isPending}>
      <div>
        <Label>Group Name *</Label>
        <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="VIP Clients" />
      </div>
      <div>
        <Label>Type</Label>
        <Select value={form.type} onValueChange={v => set("type", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="segment">Segment</SelectItem>
            <SelectItem value="industry">Industry</SelectItem>
            <SelectItem value="region">Region</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="lead_source">Lead Source</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Color</Label>
        <div className="flex gap-2 mt-1 flex-wrap">
          {groupColors.map(c => (
            <button key={c} type="button" onClick={() => set("color", c)}
              className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Describe this group..." />
      </div>
    </FormModal>
  );
}