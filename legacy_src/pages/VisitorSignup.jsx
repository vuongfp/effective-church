import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Church, User, Mail, Phone, MapPin, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import { LanguageProvider, useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";

function VisitorSignupInner() {
  const { lang } = useLang();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    interested_in_contact: false,
  });
  const [isReturning, setIsReturning] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [prefilling, setPrefilling] = useState(true);

  useEffect(() => {
    const savedId = localStorage.getItem("visitor_id");
    const savedFirstName = localStorage.getItem("visitor_first_name");
    const savedLastName = localStorage.getItem("visitor_last_name");
    const savedEmail = localStorage.getItem("visitor_email");
    const savedPhone = localStorage.getItem("visitor_phone");

    if (savedId && savedFirstName) {
      setForm(prev => ({
        ...prev,
        first_name: savedFirstName || "",
        last_name: savedLastName || "",
        email: savedEmail || "",
        phone: savedPhone || "",
      }));
      setIsReturning(true);
      setSavedName(`${savedFirstName} ${savedLastName}`);
    }
    setPrefilling(false);
  }, []);

  const clearReturning = () => {
    setIsReturning(false);
    setSavedName("");
    setForm({ first_name: "", last_name: "", email: "", phone: "", address: "", notes: "", interested_in_contact: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const savedId = isReturning ? localStorage.getItem("visitor_id") : null;

    const res = await base44.functions.invoke("saveVisitorInfo", {
      ...form,
      visitor_id: savedId || undefined,
    });

    const data = res.data;

    if (data?.visitor_id) {
      localStorage.setItem("visitor_id", data.visitor_id);
      localStorage.setItem("visitor_email", form.email);
      localStorage.setItem("visitor_first_name", form.first_name);
      localStorage.setItem("visitor_last_name", form.last_name);
      localStorage.setItem("visitor_phone", form.phone);
    }

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      window.location.href = createPageUrl("ChurchHome");
    }, 2000);
  };

  if (prefilling) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t("visitor_success_title", lang)}</h2>
          <p className="text-blue-200">{t("visitor_success_subtitle", lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Church className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{t("visitor_welcome_title", lang)}</h1>
          <p className="text-blue-200 text-sm">{t("visitor_welcome_subtitle", lang)}</p>
        </div>

        {isReturning && (
          <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">{t("visitor_returning_greeting", lang)}, {savedName}!</p>
                <p className="text-green-300 text-xs">{t("visitor_returning_subtitle", lang)}</p>
              </div>
            </div>
            <button onClick={clearReturning} className="text-green-300 hover:text-white text-xs underline shrink-0 ml-3">
              {t("visitor_not_me", lang)}
            </button>
          </div>
        )}

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{t("visitor_first_name", lang)} *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <Input required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                      placeholder={lang === "fr" ? "Jean" : lang === "vi" ? "Nguyễn" : "John"} className="pl-9" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{t("visitor_last_name", lang)} *</label>
                  <Input required value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    placeholder={lang === "fr" ? "Dupont" : lang === "vi" ? "Văn A" : "Smith"} />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">{t("visitor_email", lang)}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com" className="pl-9" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">{t("visitor_phone", lang)}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="(416) 555-0100" className="pl-9" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">{t("visitor_address", lang)}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder={t("visitor_address_placeholder", lang)} className="pl-9" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">{t("visitor_notes", lang)}</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={t("visitor_notes_placeholder", lang)} className="pl-9" />
                </div>
              </div>

              <div className="flex items-center gap-3 py-1">
                <input type="checkbox" id="contact_check" checked={form.interested_in_contact}
                  onChange={e => setForm(f => ({ ...f, interested_in_contact: e.target.checked }))}
                  className="w-4 h-4 rounded accent-blue-600" />
                <label htmlFor="contact_check" className="text-sm text-slate-600 cursor-pointer">
                  {t("visitor_contact_interest", lang)}
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold h-11">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("visitor_saving", lang)}</>
                  : isReturning ? t("visitor_confirm_btn", lang) : t("visitor_checkin_btn", lang)
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-blue-300 text-xs mt-4">{t("visitor_privacy_note", lang)}</p>
      </div>
    </div>
  );
}

export default function VisitorSignup() {
  return (
    <LanguageProvider>
      <VisitorSignupInner />
    </LanguageProvider>
  );
}