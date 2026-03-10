import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ContactSelector from "@/components/shared/ContactSelector";

export default function PrayerRequestForm({ open, onOpenChange, prayerRequest, onSaved }) {
  const [data, setData] = useState(prayerRequest || {
    contact_id: "",
    contact_name: "",
    request_content: "",
    status: "open",
    request_date: new Date().toISOString().split('T')[0],
    category: "other",
    is_confidential: false,
    notes: "",
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    setData(prayerRequest || {
      contact_id: "",
      contact_name: "",
      request_content: "",
      status: "open",
      request_date: new Date().toISOString().split('T')[0],
      category: "other",
      is_confidential: false,
      notes: "",
    });
  }, [prayerRequest, open]);

  const isEdit = !!prayerRequest?.id;

  const createMutation = useMutation({
    mutationFn: (formData) => base44.entities.PrayerRequest.create(formData),
    onSuccess: () => {
      onSaved();
      queryClient.invalidateQueries({ queryKey: ["prayer_requests"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => base44.entities.PrayerRequest.update(prayerRequest.id, formData),
    onSuccess: () => {
      onSaved();
      queryClient.invalidateQueries({ queryKey: ["prayer_requests"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Prayer Request" : "Add Prayer Request"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Contact *</label>
            <ContactSelector
              value={data.contact_id || ""}
              onChange={(contact) => setData({ ...data, contact_id: contact.id, contact_name: contact.name })}
              placeholder="Search member or contact..."
            />
          </div>

          <Textarea
            placeholder="Prayer Request Content"
            value={data.request_content || ""}
            onChange={(e) => setData({ ...data, request_content: e.target.value })}
            required
            className="h-24"
          />

          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <Select value={data.category || "other"} onValueChange={(value) => setData({ ...data, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="spiritual">Spiritual</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <Select value={data.status || "open"} onValueChange={(value) => setData({ ...data, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Request Date</label>
            <Input
              type="date"
              value={data.request_date || ""}
              onChange={(e) => setData({ ...data, request_date: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_confidential"
              checked={data.is_confidential || false}
              onCheckedChange={(checked) => setData({ ...data, is_confidential: checked })}
            />
            <Label htmlFor="is_confidential" className="font-normal">Confidential</Label>
          </div>

          <Textarea
            placeholder="Notes / Updates"
            value={data.notes || ""}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            className="h-16"
          />

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}