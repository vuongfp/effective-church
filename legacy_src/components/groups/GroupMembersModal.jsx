import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, UserPlus, Check } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function GroupMembersModal({ group, contacts, onClose }) {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const memberIds = group.member_ids || [];

  const mutation = useMutation({
    mutationFn: (newIds) => base44.entities.Group.update(group.id, { member_ids: newIds, member_count: newIds.length }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const toggle = (contactId) => {
    const newIds = memberIds.includes(contactId)
      ? memberIds.filter(id => id !== contactId)
      : [...memberIds, contactId];
    mutation.mutate(newIds);
  };

  const filtered = contacts.filter(c => {
    const term = search.toLowerCase();
    return `${c.first_name} ${c.last_name}`.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term);
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Members — {group.name}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 mt-2">
          {filtered.map(contact => {
            const isMember = memberIds.includes(contact.id);
            return (
              <div key={contact.id} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${isMember ? "bg-indigo-50" : "hover:bg-slate-50"}`} onClick={() => toggle(contact.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                    {contact.first_name?.[0]}{contact.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{contact.first_name} {contact.last_name}</p>
                    <p className="text-xs text-slate-500">{contact.company || contact.email}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isMember ? "bg-indigo-500 border-indigo-500" : "border-slate-300"}`}>
                  {isMember && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            );
          })}
        </div>
        <div className="pt-3 border-t flex items-center justify-between">
          <span className="text-sm text-slate-500">{memberIds.length} members selected</span>
          <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700">Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}