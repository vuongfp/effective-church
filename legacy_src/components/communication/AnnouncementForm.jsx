import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import FormModal from "@/components/shared/FormModal";

const EMPTY = { title: "", content: "", published_date: "", target: "all", channel: "internal", pinned: false };

export default function AnnouncementForm({ open, onOpenChange, announcement, onSaved }) {
  const { lang } = useLang();
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { setForm(announcement ? { ...EMPTY, ...announcement } : EMPTY); }, [announcement, open]);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const mutation = useMutation({
    mutationFn: (data) => announcement ? base44.entities.Announcement.update(announcement.id, data) : base44.entities.Announcement.create(data),
    onSuccess: onSaved,
  });

  const handleDelete = async () => {
    if (window.confirm(lang === "vi" ? "Xóa thông báo này?" : "Delete this announcement?")) {
      await base44.entities.Announcement.delete(announcement.id);
      onSaved();
    }
  };

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={announcement ? t("Edit", lang) : (lang === "vi" ? "Đăng thông báo" : "New Announcement")} onSubmit={() => mutation.mutate(form)} isLoading={mutation.isPending} onDelete={announcement ? handleDelete : undefined}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Tiêu đề" : "Title"} *</label>
          <Input value={form.title} onChange={e => set("title", e.target.value)} className="mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Nội dung" : "Content"} *</label>
          <textarea value={form.content} onChange={e => set("content", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400 h-28 resize-none" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Kênh" : "Channel"}</label>
            <select value={form.channel} onChange={e => set("channel", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="internal">{lang === "vi" ? "Nội bộ" : "Internal"}</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Đối tượng" : "Target"}</label>
            <select value={form.target} onChange={e => set("target", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="all">{lang === "vi" ? "Tất cả" : "All"}</option>
              <option value="members">{lang === "vi" ? "Thành viên" : "Members"}</option>
              <option value="leaders">{lang === "vi" ? "Ban lãnh đạo" : "Leaders"}</option>
              <option value="kids">{lang === "vi" ? "Thiếu nhi" : "Kids"}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Ngày đăng" : "Published Date"}</label>
            <Input type="date" value={form.published_date} onChange={e => set("published_date", e.target.value)} className="mt-1" />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="pinned" checked={form.pinned} onChange={e => set("pinned", e.target.checked)} className="rounded" />
            <label htmlFor="pinned" className="text-sm text-slate-700">{lang === "vi" ? "Ghim lên đầu" : "Pin to top"}</label>
          </div>
        </div>
      </div>
    </FormModal>
  );
}