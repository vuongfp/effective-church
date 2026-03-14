"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FormModal from "@/components/shared/FormModal";
import { useLang } from "@/components/i18n/LanguageContext";

const PERMISSIONS = [
  "manage_members",
  "manage_visitors",
  "manage_events",
  "manage_groups",
  "manage_finances",
  "manage_announcements",
  "manage_staff",
  "view_reports"
];

const getRoles = (lang: string) => [
  { value: "pastor", label: lang === "vi" ? "Mục sư" : "Pastor" },
  { value: "assistant_pastor", label: lang === "vi" ? "Phó mục sư" : "Assistant Pastor" },
  { value: "worship_leader", label: lang === "vi" ? "Trưởng ban ca ngợi" : "Worship Leader" },
  { value: "youth_director", label: lang === "vi" ? "Trưởng ban thanh niên" : "Youth Director" },
  { value: "children_director", label: lang === "vi" ? "Trưởng ban thiếu nhi" : "Children's Director" },
  { value: "administrative", label: lang === "vi" ? "Hành chính" : "Administrative" },
  { value: "volunteer_coordinator", label: lang === "vi" ? "Điều phối tình nguyện viên" : "Volunteer Coordinator" },
  { value: "treasurer", label: lang === "vi" ? "Thủ quỹ" : "Treasurer" },
  { value: "secretary", label: lang === "vi" ? "Thư ký" : "Secretary" },
  { value: "other", label: lang === "vi" ? "Khác" : "Other" }
];

const getDepartments = (lang: string) => [
  { value: "pastoral", label: lang === "vi" ? "Mục vụ" : "Pastoral" },
  { value: "worship", label: lang === "vi" ? "Ca ngợi" : "Worship" },
  { value: "youth", label: lang === "vi" ? "Thanh niên" : "Youth" },
  { value: "children", label: lang === "vi" ? "Thiếu nhi" : "Children" },
  { value: "administrative", label: lang === "vi" ? "Hành chính" : "Administrative" },
  { value: "finance", label: lang === "vi" ? "Tài chính" : "Finance" },
  { value: "outreach", label: lang === "vi" ? "Tiếp cận cộng đồng" : "Outreach" },
  { value: "other", label: lang === "vi" ? "Khác" : "Other" }
];

const getLabels = (lang: string) => ({
  firstName: lang === "vi" ? "Tên" : "First Name",
  lastName: lang === "vi" ? "Họ" : "Last Name",
  email: "Email",
  phone: lang === "vi" ? "Số điện thoại" : "Phone",
  role: lang === "vi" ? "Vai trò" : "Role",
  department: lang === "vi" ? "Phòng ban" : "Department",
  startDate: lang === "vi" ? "Ngày bắt đầu" : "Start Date",
  status: lang === "vi" ? "Trạng thái" : "Status",
  active: lang === "vi" ? "Đang hoạt động" : "Active",
  inactive: lang === "vi" ? "Không hoạt động" : "Inactive",
  onLeave: lang === "vi" ? "Đang nghỉ phép" : "On Leave",
  address: lang === "vi" ? "Địa chỉ" : "Address",
  emergency: lang === "vi" ? "Liên hệ khẩn cấp" : "Emergency Contact",
  biography: lang === "vi" ? "Tiểu sử" : "Biography",
  notes: lang === "vi" ? "Ghi chú" : "Notes",
  permissions: lang === "vi" ? "Quyền hạn" : "Permissions"
});

interface StaffFormProps {
  staff?: any | null;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function StaffForm({ staff, onSaved, onCancel }: StaffFormProps) {
  const { lang } = useLang();
  const labels = getLabels(lang);
  const title = staff ? (lang === "vi" ? "Cập nhật nhân viên" : "Update Staff") : (lang === "vi" ? "Thêm nhân viên mới" : "Add New Staff");
  const roles = getRoles(lang);
  const departments = getDepartments(lang);
  const [data, setData] = useState(staff || {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "other",
    department: "other",
    status: "active",
    start_date: new Date().toISOString().split("T")[0],
    biography: "",
    address: "",
    emergency_contact: "",
    notes: "",
    permissions: []
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: any) => {
      const supabase = createClient();
      if (staff?.id) {
        const { error } = await supabase.from('staff').update(formData).eq('id', staff.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('staff').insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      onSaved?.();
    }
  });

  const handleSubmit = () => {
    mutation.mutate(data);
  };

  const togglePermission = (permission: string) => {
    const perms = data.permissions || [];
    if (perms.includes(permission)) {
      setData({ ...data, permissions: perms.filter((p: string) => p !== permission) });
    } else {
      setData({ ...data, permissions: [...perms, permission] });
    }
  };

  return (
    <FormModal
      title={title}
      onClose={onCancel}
      onSubmit={handleSubmit}
      isLoading={mutation.isPending}
    >
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder={labels.firstName}
            value={data.first_name}
            onChange={(e) => setData({ ...data, first_name: e.target.value })}
            required
          />
          <Input
            placeholder={labels.lastName}
            value={data.last_name}
            onChange={(e) => setData({ ...data, last_name: e.target.value })}
            required
          />
        </div>

        <Input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          required
        />

        <Input
          type="tel"
          placeholder={labels.phone}
          value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-1 block">{labels.role}</Label>
            <Select value={data.role} onValueChange={(v) => setData({ ...data, role: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">{labels.department}</Label>
            <Select value={data.department} onValueChange={(v) => setData({ ...data, department: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            value={data.start_date}
            onChange={(e) => setData({ ...data, start_date: e.target.value })}
            placeholder={labels.startDate}
          />
          <Select value={data.status || "active"} onValueChange={(v) => setData({ ...data, status: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{labels.active}</SelectItem>
              <SelectItem value="inactive">{labels.inactive}</SelectItem>
              <SelectItem value="on_leave">{labels.onLeave}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Input
          placeholder={labels.address}
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
        />

        <Input
          placeholder={labels.emergency}
          value={data.emergency_contact}
          onChange={(e) => setData({ ...data, emergency_contact: e.target.value })}
        />

        <Textarea
          placeholder={labels.biography}
          value={data.biography}
          onChange={(e) => setData({ ...data, biography: e.target.value })}
          className="h-20"
        />

        <Textarea
          placeholder={labels.notes}
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          className="h-16"
        />

        {/* Permissions */}
        <div className="border-t pt-4">
          <Label className="text-sm font-semibold mb-2 block">{labels.permissions}</Label>
          <div className="grid grid-cols-2 gap-3">
            {PERMISSIONS.map(perm => (
              <div key={perm} className="flex items-center gap-2">
                <Checkbox
                  id={perm}
                  checked={(data.permissions || []).includes(perm)}
                  onCheckedChange={() => togglePermission(perm)}
                />
                <Label htmlFor={perm} className="text-xs font-normal cursor-pointer">
                  {perm.replace(/_/g, " ")}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FormModal>
  );
}