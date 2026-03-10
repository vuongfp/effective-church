import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import AssigneeSelector from "@/components/shared/AssigneeSelector";

export default function PastoralActivityForm({ open, onOpenChange, activity, onSaved }) {
  const [data, setData] = useState(activity || {
    contact_id: "",
    contact_name: "",
    activity_type: "visit",
    activity_date: new Date().toISOString().split('T')[0],
    assigned_to: "",
    assigned_to_name: "",
    notes: "",
    follow_up_date: "",
    follow_up_completed: false,
  });
  const queryClient = useQueryClient();

  const isEdit = !!activity?.id;

  const createMutation = useMutation({
    mutationFn: (formData) => base44.entities.PastoralCareActivity.create(formData),
    onSuccess: () => {
      onSaved();
      queryClient.invalidateQueries({ queryKey: ["pastoral_activities"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => base44.entities.PastoralCareActivity.update(activity.id, formData),
    onSuccess: () => {
      onSaved();
      queryClient.invalidateQueries({ queryKey: ["pastoral_activities"] });
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
          <DialogTitle>{isEdit ? "Edit Activity" : "Add Activity"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Contact Name"
            value={data.contact_name || ""}
            onChange={(e) => setData({ ...data, contact_name: e.target.value })}
            required
          />

          <div>
            <label className="text-sm font-medium text-slate-700">Activity Type</label>
            <Select value={data.activity_type || "visit"} onValueChange={(value) => setData({ ...data, activity_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visit">Visit</SelectItem>
                <SelectItem value="phone_call">Phone Call</SelectItem>
                <SelectItem value="counseling">Counseling</SelectItem>
                <SelectItem value="prayer">Prayer</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Date</label>
            <Input
              type="date"
              value={data.activity_date || ""}
              onChange={(e) => setData({ ...data, activity_date: e.target.value })}
              required
            />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Assigned To *</label>
              <AssigneeSelector
                value={data.assigned_to || ""}
                onChange={(assignee) => setData({ ...data, assigned_to: assignee.id, assigned_to_name: assignee.name })}
                placeholder="Search staff or volunteer..."
              />
            </div>

          <Textarea
            placeholder="Notes / Details"
            value={data.notes || ""}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            className="h-20"
          />

          <div>
            <label className="text-sm font-medium text-slate-700">Follow-up Date (Optional)</label>
            <Input
              type="date"
              value={data.follow_up_date || ""}
              onChange={(e) => setData({ ...data, follow_up_date: e.target.value })}
            />
          </div>

          {data.follow_up_date && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="follow_up_completed"
                checked={data.follow_up_completed || false}
                onCheckedChange={(checked) => setData({ ...data, follow_up_completed: checked })}
              />
              <Label htmlFor="follow_up_completed" className="font-normal">Follow-up Completed</Label>
            </div>
          )}

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