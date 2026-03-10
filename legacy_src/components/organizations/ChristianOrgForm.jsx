import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import FormModal from "@/components/shared/FormModal";

const EMPTY = { name: "", description: "", function: "evangelism", website: "", phone: "", email: "", address: "", contact_person: "", relationship: "partner", notes: "" };

export default function ChristianOrgForm({ open, onOpenChange, org, onSaved }) {
  const { lang } = useLang();
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { setForm(org ? { ...EMPTY, ...org } : EMPTY); }, [org, open]);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const mutation = useMutation({
    mutationFn: (data) => org ? base44.entities.ChristianOrganization.update(org.id, data) : base44.entities.ChristianOrganization.create(data),
    onSuccess: onSaved,
  });

  const handleDelete = async () => {
    if (window.confirm(lang === "vi" ? "Xóa tổ chức này?" : "Delete this organization?")) {
      await base44.entities.ChristianOrganization.delete(org.id);
      onSaved();
    }
  };

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={org ? t("Edit", lang) : (lang === "vi" ? "Thêm tổ chức" : "Add Organization")} onSubmit={() => mutation.mutate(form)} isLoading={mutation.isPending} onDelete={org ? handleDelete : undefined}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Tên tổ chức" : "Organization Name"} *</label>
          <Input value={form.name} onChange={e => set("name", e.target.value)} className="mt-1" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Chức năng" : "Function"}</label>
            <select value={form.function} onChange={e => set("function", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="evangelism">{lang === "vi" ? "Truyền giáo" : "Evangelism"}</option>
              <option value="education">{lang === "vi" ? "Giáo dục" : "Education"}</option>
              <option value="social_work">{lang === "vi" ? "Công tác Xã hội" : "Social Work"}</option>
              <option value="worship">{lang === "vi" ? "Thờ phượng" : "Worship"}</option>
              <option value="youth">{lang === "vi" ? "Thanh thiếu niên" : "Youth"}</option>
              <option value="missions">{lang === "vi" ? "Truyền giáo" : "Missions"}</option>
              <option value="media">{lang === "vi" ? "Truyền thông" : "Media"}</option>
              <option value="other">{lang === "vi" ? "Khác" : "Other"}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Mối quan hệ" : "Relationship"}</label>
            <select value={form.relationship} onChange={e => set("relationship", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="partner">{lang === "vi" ? "Đối tác" : "Partner"}</option>
              <option value="affiliated">{lang === "vi" ? "Liên kết" : "Affiliated"}</option>
              <option value="supported">{lang === "vi" ? "Được hỗ trợ" : "Supported"}</option>
              <option value="supporting">{lang === "vi" ? "Đang hỗ trợ" : "Supporting"}</option>
              <option value="other">{lang === "vi" ? "Khác" : "Other"}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Người liên hệ" : "Contact Person"}</label>
          <Input value={form.contact_person} onChange={e => set("contact_person", e.target.value)} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Điện thoại" : "Phone"}</label><Input value={form.phone} onChange={e => set("phone", e.target.value)} className="mt-1" /></div>
          <div><label className="text-sm font-medium text-slate-700">Email</label><Input value={form.email} onChange={e => set("email", e.target.value)} className="mt-1" /></div>
        </div>
        <div><label className="text-sm font-medium text-slate-700">Website</label><Input value={form.website} onChange={e => set("website", e.target.value)} className="mt-1" placeholder="https://..." /></div>
        <div><label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Địa chỉ" : "Address"}</label><Input value={form.address} onChange={e => set("address", e.target.value)} className="mt-1" /></div>
        <div>
          <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Mô tả" : "Description"}</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400 h-20 resize-none" />
        </div>
      </div>
    </FormModal>
  );
}