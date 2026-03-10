import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import FormModal from "../shared/FormModal";
import { X } from "lucide-react";
import { useLang } from "../i18n/LanguageContext";

const EMPTY = {
  first_name: "", last_name: "", email: "", phone: "",
  sex: "", marital_status: "", birthday: "", baptism: false,
  address: "", status: "active", notes: "", groups: [],
  profession: "", role: "", member_since: "", is_kid: false,
};

export default function MemberForm({ open, onOpenChange, member, onSaved }) {
  const { lang } = useLang();
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: () => base44.entities.Group.list(),
  });

  useEffect(() => {
    if (member) setForm({ ...EMPTY, ...member, groups: member.groups || [] });
    else setForm(EMPTY);
  }, [member, open]);

  const mutation = useMutation({
    mutationFn: (data) => member
      ? base44.entities.Contact.update(member.id, data)
      : base44.entities.Contact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      onSaved();
    },
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleGroup = (groupId) => {
    setForm(prev => {
      const current = prev.groups || [];
      if (current.includes(groupId)) return { ...prev, groups: current.filter(g => g !== groupId) };
      return { ...prev, groups: [...current, groupId] };
    });
  };

  const removeGroup = (groupId) => setForm(prev => ({ ...prev, groups: (prev.groups || []).filter(g => g !== groupId) }));

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : groupId;
  };

  const handleSubmit = () => mutation.mutate(form);

  const L = {
    title: { en: member ? "Edit Member Profile" : "Add Member", vi: member ? "Sửa thành viên" : "Thêm thành viên", fr: member ? "Modifier profil du membre" : "Ajouter membre" },
    firstName: { en: "First Name *", vi: "Tên *", fr: "Prénom *" },
    lastName: { en: "Last Name *", vi: "Họ *", fr: "Nom *" },
    phone: { en: "Phone", vi: "Điện thoại", fr: "Téléphone" },
    sex: { en: "Gender", vi: "Giới tính", fr: "Genre" },
    male: { en: "Male", vi: "Nam", fr: "Homme" },
    female: { en: "Female", vi: "Nữ", fr: "Femme" },
    marital: { en: "Marital Status", vi: "Hôn nhân", fr: "État civil" },
    birthday: { en: "Birthday", vi: "Ngày sinh", fr: "Date de naissance" },
    baptism: { en: "Baptism", vi: "Báp-têm", fr: "Baptême" },
    baptized: { en: "Baptized", vi: "Đã báp-têm", fr: "Baptisé" },
    notBaptized: { en: "Not yet baptized", vi: "Chưa báp-têm", fr: "Pas encore baptisé" },
    address: { en: "Address", vi: "Địa chỉ", fr: "Adresse" },
    profession: { en: "Profession", vi: "Nghề nghiệp", fr: "Profession" },
    role: { en: "Role / Ministry", vi: "Vai trò / Chức vụ", fr: "Rôle / Ministère" },
    memberSince: { en: "Member Since", vi: "Thành viên từ", fr: "Membre depuis" },
    groups: { en: "Groups / Ministries", vi: "Nhóm / Tế bào", fr: "Groupes / Ministères" },
    noGroups: { en: "No groups available", vi: "Chưa có nhóm", fr: "Aucun groupe" },
    status: { en: "Status", vi: "Trạng thái", fr: "Statut" },
    active: { en: "Active", vi: "Đang hoạt động", fr: "Actif" },
    inactive: { en: "Inactive", vi: "Không hoạt động", fr: "Inactif" },
    notes: { en: "Notes", vi: "Ghi chú", fr: "Notes" },
  };
  const lv = (key) => L[key]?.[lang] || L[key]?.en || key;

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={lv("title")}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{lv("firstName")}</Label>
          <Input value={form.first_name} onChange={e => set("first_name", e.target.value)} />
        </div>
        <div>
          <Label>{lv("lastName")}</Label>
          <Input value={form.last_name} onChange={e => set("last_name", e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Email *</Label>
        <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{lv("phone")}</Label>
          <Input value={form.phone} onChange={e => set("phone", e.target.value)} />
        </div>
        <div>
          <Label>{lv("sex")}</Label>
          <Select value={form.sex || "none"} onValueChange={v => set("sex", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              <SelectItem value="M">{lv("male")}</SelectItem>
              <SelectItem value="F">{lv("female")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{lv("birthday")}</Label>
          <Input type="date" value={form.birthday || ""} onChange={e => set("birthday", e.target.value)} />
        </div>
        <div>
          <Label>{lv("marital")}</Label>
          <Select value={form.marital_status || "none"} onValueChange={v => set("marital_status", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              <SelectItem value="Single">{lang === "vi" ? "Độc thân" : lang === "fr" ? "Célibataire" : "Single"}</SelectItem>
              <SelectItem value="Married">{lang === "vi" ? "Kết hôn" : lang === "fr" ? "Marié(e)" : "Married"}</SelectItem>
              <SelectItem value="Widowed">{lang === "vi" ? "Góa" : lang === "fr" ? "Veuf/Veuve" : "Widowed"}</SelectItem>
              <SelectItem value="Divorced">{lang === "vi" ? "Ly hôn" : lang === "fr" ? "Divorcé(e)" : "Divorced"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{lv("memberSince")}</Label>
          <Input type="date" value={form.member_since || ""} onChange={e => set("member_since", e.target.value)} />
        </div>
        <div>
          <Label>{lv("role")}</Label>
          <Input value={form.role} onChange={e => set("role", e.target.value)} placeholder={lang === "vi" ? "Trưởng nhóm..." : "Worship leader..."} />
        </div>
      </div>

      <div>
        <Label>{lv("address")}</Label>
        <Input value={form.address} onChange={e => set("address", e.target.value)} />
      </div>

      <div>
        <Label>{lv("profession")}</Label>
        <Select value={form.profession || "none"} onValueChange={v => set("profession", v === "none" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">—</SelectItem>
            {["student","teacher","engineer","doctor","nurse","business","farmer","clergy","artist","lawyer","accountant","it","social_worker","homemaker","retired","unemployed","other"].map(p => (
              <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1).replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Baptism toggle */}
      <div>
        <Label>{lv("baptism")}</Label>
        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={() => set("baptism", true)}
            className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${form.baptism ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-medium" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
          >
            ✓ {lv("baptized")}
          </button>
          <button
            type="button"
            onClick={() => set("baptism", false)}
            className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${!form.baptism ? "bg-slate-50 border-slate-400 text-slate-700 font-medium" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}
          >
            {lv("notBaptized")}
          </button>
        </div>
      </div>

      {/* Group assignment */}
      <div>
        <Label>{lv("groups")}</Label>
        {/* Selected tags */}
        {(form.groups || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
            {(form.groups || []).map(groupId => (
              <span key={groupId} className="flex items-center gap-1 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                {getGroupName(groupId)}
                <button type="button" onClick={() => removeGroup(groupId)} className="ml-0.5 hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {groups.length === 0 ? (
          <p className="text-xs text-slate-400 mt-1">{lv("noGroups")}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {groups.map(g => {
              const selected = (form.groups || []).includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGroup(g.id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${selected ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-600"}`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <Label>{lv("status")}</Label>
        <Select value={form.status} onValueChange={v => set("status", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{lv("active")}</SelectItem>
            <SelectItem value="inactive">{lv("inactive")}</SelectItem>
            <SelectItem value="deceased">{lang === "vi" ? "Đã qua đời" : lang === "fr" ? "Décédé" : "Deceased"}</SelectItem>
            <SelectItem value="transferred">{lang === "vi" ? "Đã chuyển đi" : lang === "fr" ? "Transféré" : "Transferred"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{lv("notes")}</Label>
        <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} />
      </div>
    </FormModal>
  );
}