"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormModal from "../shared/FormModal";
import { X } from "lucide-react";

const EMPTY = {
  first_name: "", last_name: "", email: "", phone: "", company: "", role: "",
  address: "", status: "active", notes: "", account_id: "",
  relationship: "", favorite_channel: "", groups: []
};

export default function ContactForm({ open, onOpenChange, contact, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [groupSearch, setGroupSearch] = useState("");
  const queryClient = useQueryClient();

  const supabase = createClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      // Return empty or fetch from members if accounts are unified
      return [];
    },
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from('groups').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (contact) {
      setForm({ ...EMPTY, ...contact, groups: contact.groups || [] });
    } else {
      setForm(EMPTY);
    }
    setGroupSearch("");
  }, [contact, open]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (contact) {
        const { error } = await supabase.from('members').update(data).eq('id', contact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('members').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      onSaved();
    },
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleGroup = (groupId) => {
    setForm(prev => {
      const current = prev.groups || [];
      if (current.includes(groupId)) return { ...prev, groups: current.filter(g => g !== groupId) };
      return { ...prev, groups: [...current, groupId] };
    });
  };

  const removeGroup = (groupId) => setForm(prev => ({ ...prev, groups: (prev.groups || []).filter(g => g !== groupId) }));

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : groupId;
  };

  const handleSubmit = () => {
    mutation.mutate(form);
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={contact ? "Edit Member Profile" : "New Contact"}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>First Name *</Label>
          <Input value={form.first_name} onChange={e => set("first_name", e.target.value)} placeholder="John" />
        </div>
        <div>
          <Label>Last Name *</Label>
          <Input value={form.last_name} onChange={e => set("last_name", e.target.value)} placeholder="Doe" />
        </div>
      </div>

      <div>
        <Label>Email *</Label>
        <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="john@example.com" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 0100" />
        </div>
        <div>
          <Label>Role / Title</Label>
          <Input value={form.role} onChange={e => set("role", e.target.value)} placeholder="CEO" />
        </div>
      </div>

      <div>
        <Label>Account</Label>
        <Select value={form.account_id || "none"} onValueChange={v => { set("account_id", v === "none" ? "" : v); const acc = accounts.find(a => a.id === v); if (acc) set("company", acc.name); }}>
          <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No account</SelectItem>
            {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Company</Label>
        <Input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Acme Inc." />
      </div>

      <div>
        <Label>Address</Label>
        <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="123 Main St, City" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Relationship</Label>
          <Select value={form.relationship || "none"} onValueChange={v => set("relationship", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="colleague">Colleague</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Favorite Channel</Label>
          <Select value={form.favorite_channel || "none"} onValueChange={v => set("favorite_channel", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="zalo">Zalo</SelectItem>
              <SelectItem value="in_person">In Person</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Groups</Label>
        {/* Selected tags */}
        {(form.groups || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
            {(form.groups || []).map(groupId => (
              <span key={groupId} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {getGroupName(groupId)}
                <button type="button" onClick={() => removeGroup(groupId)} className="ml-0.5 hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {groups.length === 0 ? (
          <p className="text-xs text-slate-400 mt-1">No groups available</p>
        ) : (
          <>
            <Input
              type="text"
              placeholder="Search groups..."
              value={groupSearch}
              onChange={e => setGroupSearch(e.target.value)}
              className="mt-1 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {groups
                .filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
                .map(g => {
                  const selected = (form.groups || []).includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGroup(g.id)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${selected ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"}`}
                    >
                      {g.name}
                    </button>
                  );
                })}
            </div>
          </>
        )}
      </div>

      <div>
        <Label>Status</Label>
        <Select value={form.status} onValueChange={v => set("status", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Additional notes..." rows={3} />
      </div>
    </FormModal>
  );
}