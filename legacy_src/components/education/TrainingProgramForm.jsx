import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import FormModal from "@/components/shared/FormModal";

const EMPTY = { name: "", description: "", category: "discipleship", start_date: "", end_date: "", instructor: "", max_participants: "", status: "upcoming" };

export default function TrainingProgramForm({ open, onOpenChange, program, onSaved }) {
  const { lang } = useLang();
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { setForm(program ? { ...EMPTY, ...program } : EMPTY); }, [program, open]);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const mutation = useMutation({
    mutationFn: (data) => program ? base44.entities.TrainingProgram.update(program.id, data) : base44.entities.TrainingProgram.create(data),
    onSuccess: onSaved,
  });

  const handleSubmit = () => {
    const data = { ...form };
    if (data.max_participants === "" || data.max_participants === null) {
      delete data.max_participants;
    } else {
      data.max_participants = Number(data.max_participants);
    }
    mutation.mutate(data);
  };

  const handleDelete = async () => {
    if (window.confirm(lang === "vi" ? "Xóa chương trình này?" : "Delete this program?")) {
      await base44.entities.TrainingProgram.delete(program.id);
      onSaved();
    }
  };

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={program ? t("Edit", lang) : (lang === "vi" ? "Thêm chương trình" : "Add Program")} onSubmit={handleSubmit} isLoading={mutation.isPending} onDelete={program ? handleDelete : undefined}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Tên chương trình" : "Program Name"} *</label>
          <Input value={form.name} onChange={e => set("name", e.target.value)} className="mt-1" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Danh mục" : "Category"}</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="discipleship">{lang === "vi" ? "Môn đồ hóa" : "Discipleship"}</option>
              <option value="leadership">{lang === "vi" ? "Lãnh đạo" : "Leadership"}</option>
              <option value="ministry">{lang === "vi" ? "Chức vụ" : "Ministry"}</option>
              <option value="vocational">{lang === "vi" ? "Nghề nghiệp" : "Vocational"}</option>
              <option value="youth">{lang === "vi" ? "Thanh thiếu niên" : "Youth"}</option>
              <option value="other">{lang === "vi" ? "Khác" : "Other"}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Trạng thái" : "Status"}</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="upcoming">{lang === "vi" ? "Sắp diễn ra" : "Upcoming"}</option>
              <option value="ongoing">{lang === "vi" ? "Đang diễn ra" : "Ongoing"}</option>
              <option value="completed">{lang === "vi" ? "Đã hoàn thành" : "Completed"}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Ngày bắt đầu" : "Start Date"}</label>
            <Input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Ngày kết thúc" : "End Date"}</label>
            <Input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Giảng viên" : "Instructor"}</label>
            <Input value={form.instructor} onChange={e => set("instructor", e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Số người tối đa" : "Max Participants"}</label>
            <Input type="number" min="0" value={form.max_participants} onChange={e => set("max_participants", e.target.value)} className="mt-1" placeholder="—" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Mô tả" : "Description"}</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400 h-20 resize-none" />
        </div>
      </div>
    </FormModal>
  );
}