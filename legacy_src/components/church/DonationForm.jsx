import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Loader2, AlertCircle } from "lucide-react";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";

const CATEGORIES = {
  general_offering: "general_offering_label",
  building_fund: "building_fund_label",
  missionary_work: "missionary_work_label",
  community_outreach: "community_outreach_label",
  special_project: "special_project_label"
};

const CATEGORY_DESCRIPTIONS = {
  general_offering: "general_offering_desc",
  building_fund: "building_fund_desc",
  missionary_work: "missionary_work_desc",
  community_outreach: "community_outreach_desc",
  special_project: "special_project_desc"
};

const DONATION_AMOUNTS = [50, 100, 250, 500, 1000, 2500];

export default function DonationForm() {
  const [formData, setFormData] = useState({
    amount: 100,
    customAmount: "",
    category: "general_offering",
    donor_name: "",
    donor_email: "",
    donor_phone: "",
    notes: "",
    is_anonymous: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { lang } = useLang();

  const handleDonate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if running in iframe (published app requirement)
      if (window.self !== window.top) {
        alert(t("Online giving only works when app is published. Please open this page in a new tab.", lang));
        setLoading(false);
        return;
      }

      const amount = formData.customAmount ? parseInt(formData.customAmount) : formData.amount;

      if (!formData.donor_email) {
        setError(t("Email là bắt buộc", lang));
        setLoading(false);
        return;
      }

      if (amount < 50) {
        setError(t("Số tiền tối thiểu là $0.50", lang));
        setLoading(false);
        return;
      }

      const response = await base44.functions.invoke('createDonationCheckout', {
        amount: amount / 100,
        category: formData.category,
        donor_name: formData.is_anonymous ? t("Anonymous", lang) : formData.donor_name,
        donor_email: formData.donor_email,
        donor_phone: formData.donor_phone,
        notes: formData.notes,
        is_anonymous: formData.is_anonymous,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setError(t("Không thể tạo phiên thanh toán. Vui lòng thử lại.", lang));
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || t("Có lỗi xảy ra. Vui lòng thử lại.", lang));
    } finally {
      setLoading(false);
    }
  };

  const selectedAmount = formData.customAmount ? parseInt(formData.customAmount) : formData.amount;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Heart className="w-6 h-6 text-red-500" />
          {t("Quyên góp trực tuyến", lang)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDonate} className="space-y-6">
          {/* Category Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">{t("Chọn loại quyên góp", lang)}</Label>
            <RadioGroup value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <div className="space-y-3">
                {Object.entries(CATEGORIES).map(([value, labelKey]) => (
                  <div key={value} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <RadioGroupItem value={value} id={value} className="mt-1" />
                    <Label htmlFor={value} className="flex-1 cursor-pointer">
                      <div className="font-medium">{t(labelKey, lang)}</div>
                      <div className="text-sm text-slate-600 mt-0.5">{t(CATEGORY_DESCRIPTIONS[value], lang)}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Amount Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">{t("Số tiền quyên góp", lang)}</Label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {DONATION_AMOUNTS.map(amt => (
                <Button
                  key={amt}
                  type="button"
                  variant={formData.amount === amt && !formData.customAmount ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, amount: amt, customAmount: "" })}
                  className="h-12 text-sm font-medium"
                >
                  ${(amt / 100).toFixed(2)}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customAmount" className="text-sm">{t("Số tiền tùy chỉnh (in cents)", lang)}</Label>
              <Input
                id="customAmount"
                type="number"
                min="50"
                placeholder={lang === "vi" ? "vd. 1500 cho $15.00" : "e.g. 1500 for $15.00"}
                value={formData.customAmount}
                onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
              />
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-slate-700">
                <span className="font-semibold">{t("Số tiền sẽ quyên góp:", lang)}</span> ${(selectedAmount / 100).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Donor Information */}
          <div className="border-t pt-6">
            <Label className="text-base font-semibold mb-3 block">{t("Thông tin người quyên góp", lang)}</Label>
            <div className="space-y-3">
              <Input
                placeholder={t("Tên", lang)}
                value={formData.donor_name}
                onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                disabled={formData.is_anonymous}
              />
              <Input
                type="email"
                placeholder={t("Email (bắt buộc)", lang)}
                value={formData.donor_email}
                onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                required
              />
              <Input
                type="tel"
                placeholder={t("Số điện thoại (tùy chọn)", lang)}
                value={formData.donor_phone}
                onChange={(e) => setFormData({ ...formData, donor_phone: e.target.value })}
              />

              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  id="anonymous"
                  checked={formData.is_anonymous}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked })}
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  {t("Quyên góp ẩn danh", lang)}
                </Label>
              </div>
            </div>
          </div>

          {/* Special Message */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium block mb-2">{t("Tin nhắn đặc biệt (tùy chọn)", lang)}</Label>
            <Textarea
              id="notes"
              placeholder={t("Ghi chú hoặc lời cầu nguyện...", lang)}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="h-24"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("Đang xử lý...", lang)}
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                {t("Quyên góp ngay", lang)}
              </>
            )}
          </Button>

          {/* Test Mode Notice */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
            💳 {t("Ứng dụng đang ở chế độ thử nghiệm. Dùng thẻ kiểm tra:", lang)} <code className="font-mono bg-yellow-100 px-1">4242 4242 4242 4242</code>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}