"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FormModal from "@/components/shared/FormModal";
import { format } from "date-fns";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";

const LABELS = {
  en: {
    updateVisitor: "Update Visitor",
    newVisitor: "Register New Visitor",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone Number",
    firstVisitDate: "First Visit Date",
    address: "Address",
    notes: "Notes",
    wantContact: "Want to be contacted for follow-up"
  },
  vi: {
    updateVisitor: "Cập nhật khách",
    newVisitor: "Đăng ký khách mới",
    firstName: "Tên",
    lastName: "Họ",
    email: "Email",
    phone: "Số điện thoại",
    firstVisitDate: "Ngày thăm viếng lần đầu",
    address: "Địa chỉ",
    notes: "Ghi chú",
    wantContact: "Muốn được liên hệ theo dõi"
  },
};

interface VisitorFormProps {
  visitor?: any | null;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function VisitorForm({ visitor, onSaved, onCancel }: VisitorFormProps) {
  const { lang } = useLang();
  const labels = LABELS[lang] || LABELS.en;
  const [data, setData] = useState(visitor || {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    first_visit_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    interested_in_contact: false
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: any) => {
      const supabase = createClient();
      if (visitor?.id) {
        const { error } = await supabase.from('visitors').update(formData).eq('id', visitor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('visitors').insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      onSaved?.();
    }
  });

  const handleSubmit = () => {
    mutation.mutate(data);
  };

  return (
    <FormModal
      title={visitor ? labels.updateVisitor : labels.newVisitor}
      onClose={onCancel}
      onSubmit={handleSubmit}
      isLoading={mutation.isPending}
    >
      <div className="space-y-4">
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
          placeholder={labels.email}
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />

        <Input
          type="tel"
          placeholder={labels.phone}
          value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
        />

        <Input
          type="date"
          placeholder={labels.firstVisitDate}
          value={data.first_visit_date}
          onChange={(e) => setData({ ...data, first_visit_date: e.target.value })}
        />

        <Input
          placeholder={labels.address}
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
        />

        <Textarea
          placeholder={labels.notes}
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          className="h-24"
        />

        <div className="flex items-center gap-2">
          <Checkbox
            id="contact"
            checked={data.interested_in_contact}
            onCheckedChange={(checked: boolean) =>
              setData({ ...data, interested_in_contact: checked })
            }
          />
          <Label htmlFor="contact" className="text-sm font-normal cursor-pointer">
            {labels.wantContact}
          </Label>
        </div>
      </div>
    </FormModal>
  );
}