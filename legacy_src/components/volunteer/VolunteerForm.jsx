import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function VolunteerForm({ open, onOpenChange, volunteer, onSaved }) {
  const [data, setData] = useState(volunteer || {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    skills: [],
    interests: [],
    availability: "available",
    status: "active",
    notes: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const queryClient = useQueryClient();

  const isEdit = !!volunteer?.id;

  const createMutation = useMutation({
    mutationFn: (formData) => base44.entities.Volunteer.create(formData),
    onSuccess: () => {
      onSaved();
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => base44.entities.Volunteer.update(volunteer.id, formData),
    onSuccess: () => {
      onSaved();
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...data,
      skills: data.skills || [],
      interests: data.interests || [],
    };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setData({
        ...data,
        skills: [...(data.skills || []), skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setData({
      ...data,
      skills: (data.skills || []).filter(s => s !== skill),
    });
  };

  const addInterest = () => {
    if (interestInput.trim()) {
      setData({
        ...data,
        interests: [...(data.interests || []), interestInput.trim()],
      });
      setInterestInput("");
    }
  };

  const removeInterest = (interest) => {
    setData({
      ...data,
      interests: (data.interests || []).filter(i => i !== interest),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Volunteer" : "Add Volunteer"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="First Name"
              value={data.first_name || ""}
              onChange={(e) => setData({ ...data, first_name: e.target.value })}
              required
            />
            <Input
              placeholder="Last Name"
              value={data.last_name || ""}
              onChange={(e) => setData({ ...data, last_name: e.target.value })}
              required
            />
          </div>

          <Input
            type="email"
            placeholder="Email"
            value={data.email || ""}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />

          <Input
            placeholder="Phone"
            value={data.phone || ""}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
          />

          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <Select value={data.status || "active"} onValueChange={(value) => setData({ ...data, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Availability</label>
            <Select value={data.availability || "available"} onValueChange={(value) => setData({ ...data, availability: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm font-medium text-slate-700">Skills</label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(data.skills || []).map((skill) => (
                <Badge key={skill} variant="secondary" className="cursor-pointer hover:bg-slate-300">
                  {skill}
                  <X className="w-3 h-3 ml-1" onClick={() => removeSkill(skill)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="text-sm font-medium text-slate-700">Interests / Ministries</label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add interest..."
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
              />
              <Button type="button" variant="outline" onClick={addInterest}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(data.interests || []).map((interest) => (
                <Badge key={interest} variant="secondary" className="cursor-pointer hover:bg-slate-300">
                  {interest}
                  <X className="w-3 h-3 ml-1" onClick={() => removeInterest(interest)} />
                </Badge>
              ))}
            </div>
          </div>

          <Textarea
            placeholder="Notes"
            value={data.notes || ""}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            className="h-24"
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