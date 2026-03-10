import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";
import FormModal from "@/components/shared/FormModal";
import AssigneeSelector from "@/components/shared/AssigneeSelector";

const EMPTY = { title: "", description: "", category: "administration", status: "pending", priority: "medium", assigned_to: "", assigned_to_name: "", due_date: "", notes: "" };

export default function TaskForm({ open, onOpenChange, task, onSaved }) {
  const { lang } = useLang();
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(task ? { ...EMPTY, ...task } : EMPTY);
  }, [task, open]);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const mutation = useMutation({
    mutationFn: (data) => task ? base44.entities.Task.update(task.id, data) : base44.entities.Task.create(data),
    onSuccess: onSaved,
  });

  const handleDelete = async () => {
    if (window.confirm(lang === "vi" ? "Xóa nhiệm vụ này?" : "Delete this task?")) {
      await base44.entities.Task.delete(task.id);
      onSaved();
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={task ? t("Edit", lang) : (lang === "vi" ? "Thêm nhiệm vụ" : "Add Task")}
      onSubmit={() => mutation.mutate(form)}
      isLoading={mutation.isPending}
      onDelete={task ? handleDelete : undefined}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Tiêu đề" : "Title"} *</label>
          <Input value={form.title} onChange={e => set("title", e.target.value)} className="mt-1" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Danh mục" : "Category"}</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="administration">{lang === "vi" ? "Quản trị" : "Administration"}</option>
              <option value="pastoral_care">{lang === "vi" ? "Chăm sóc Mục vụ" : "Pastoral Care"}</option>
              <option value="social_responsibility">{lang === "vi" ? "Trách nhiệm Xã hội" : "Social Responsibility"}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Trạng thái" : "Status"}</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="pending">{lang === "vi" ? "Đang chờ" : "Pending"}</option>
              <option value="in_progress">{lang === "vi" ? "Đang thực hiện" : "In Progress"}</option>
              <option value="done">{lang === "vi" ? "Đã xong" : "Done"}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Ưu tiên" : "Priority"}</label>
            <select value={form.priority} onChange={e => set("priority", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="urgent">{lang === "vi" ? "Khẩn cấp" : "Urgent"}</option>
              <option value="high">{lang === "vi" ? "Cao" : "High"}</option>
              <option value="medium">{lang === "vi" ? "Trung bình" : "Medium"}</option>
              <option value="low">{lang === "vi" ? "Thấp" : "Low"}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Hạn" : "Due Date"}</label>
            <Input type="date" value={form.due_date} onChange={e => set("due_date", e.target.value)} className="mt-1" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Người phụ trách" : "Assigned To"} *</label>
          <AssigneeSelector
            value={form.assigned_to}
            onChange={(assignee) => set("assigned_to", assignee.id)}
            placeholder={lang === "vi" ? "Tìm kiếm nhân viên hoặc tình nguyện viên..." : "Search staff or volunteer..."}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">{lang === "vi" ? "Mô tả" : "Description"}</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400 h-20 resize-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">{t("Notes", lang)}</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400 h-16 resize-none" />
        </div>
      </div>
    </FormModal>
  );
}