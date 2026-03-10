import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormModal from "../shared/FormModal";

const INDUSTRIES = ["technology", "healthcare", "finance", "retail", "manufacturing", "education", "real_estate", "consulting", "media", "other"];
const SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export default function AccountForm({ open, onOpenChange, account, onSaved }) {
  const [form, setForm] = useState({
    name: "", industry: "", size: "", estimated_revenue: "", type: "prospect", website: "", address: "", phone: "", notes: ""
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (account) {
      setForm({ ...account, estimated_revenue: account.estimated_revenue || "" });
    } else {
      setForm({ name: "", industry: "", size: "", estimated_revenue: "", type: "prospect", website: "", address: "", phone: "", notes: "" });
    }
  }, [account, open]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, estimated_revenue: data.estimated_revenue ? Number(data.estimated_revenue) : null };
      return account ? base44.entities.Account.update(account.id, payload) : base44.entities.Account.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onSaved();
    },
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={account ? "Edit Account" : "New Account"} onSubmit={() => mutation.mutate(form)} isSubmitting={mutation.isPending}>
      <div>
        <Label>Company Name *</Label>
        <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Acme Corp" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Industry</Label>
          <Select value={form.industry || "none"} onValueChange={v => set("industry", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select industry</SelectItem>
              {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Company Size</Label>
          <Select value={form.size || "none"} onValueChange={v => set("size", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select size</SelectItem>
              {SIZES.map(s => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Account Type</Label>
          <Select value={form.type} onValueChange={v => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="former_customer">Former Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Est. Revenue ($)</Label>
          <Input type="number" value={form.estimated_revenue} onChange={e => set("estimated_revenue", e.target.value)} placeholder="1000000" />
        </div>
      </div>
      <div>
        <Label>Website</Label>
        <Input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://example.com" />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 0100" />
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} />
      </div>
    </FormModal>
  );
}