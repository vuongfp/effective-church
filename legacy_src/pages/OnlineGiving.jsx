import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import DonationForm from "@/components/church/DonationForm";
import { useLang } from "@/components/i18n/LanguageContext";
import { t } from "@/components/i18n/translations";

export default function OnlineGiving() {
  const { lang } = useLang();

  const { data: donations = [] } = useQuery({
    queryKey: ["donations"],
    queryFn: () => base44.entities.Donation.list("-created_date")
  });

  const stats = {
    totalDonations: donations.reduce((sum, d) => sum + (d.amount || 0), 0) / 100,
    totalCount: donations.filter(d => d.status === "completed").length,
    totalDonors: new Set(donations.filter(d => d.status === "completed").map(d => d.donor_email)).size,
  };

  const categoryTotals = donations
    .filter(d => d.status === "completed")
    .reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + (d.amount || 0);
      return acc;
    }, {});

  const getCategoryLabel = (category) => {
    const labels = {
      general_offering: t("Dâng hiến chung", lang),
      building_fund: t("Quỹ xây dựng", lang),
      missionary_work: t("Công tác truyền giáo", lang),
      community_outreach: t("Tổng quát cộng đồng", lang),
      special_project: t("Dự án đặc biệt", lang)
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
         <div className="mb-8">
           <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
             <Heart className="w-8 h-8 text-red-500" />
             {t("Quyên góp trực tuyến", lang)}
           </h1>
           <p className="text-slate-600 mt-2">
             {t("Hãy giúp hội thánh phát triển thông qua quyên góp trực tuyến an toàn và tiện lợi.", lang)}
           </p>
         </div>

        <Tabs defaultValue="donate" className="space-y-6">
           <TabsList className="grid w-full grid-cols-2">
             <TabsTrigger value="donate">{t("Quyên góp", lang)}</TabsTrigger>
             <TabsTrigger value="history">{t("Lịch sử & Thống kê", lang)}</TabsTrigger>
           </TabsList>

          {/* Donation Form Tab */}
          <TabsContent value="donate" className="space-y-6">
            <div className="flex justify-center">
              <DonationForm />
            </div>
          </TabsContent>

          {/* History & Stats Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm text-slate-600 font-medium">{t("Tổng quyên góp", lang)}</CardTitle>
                 </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">
                    ${stats.totalDonations.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm text-slate-600 font-medium">{t("Lượt quyên góp", lang)}</CardTitle>
                 </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.totalCount}</div>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm text-slate-600 font-medium">{t("Số người quyên góp", lang)}</CardTitle>
                 </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.totalDonors}</div>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            {Object.keys(categoryTotals).length > 0 && (
              <Card>
                <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <TrendingUp className="w-5 h-5" />
                     {t("Phân bổ theo loại quyên góp", lang)}
                   </CardTitle>
                 </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(categoryTotals).map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="text-sm font-medium">{getCategoryLabel(category)}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden mx-4 min-w-24">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${Math.min(100, (amount / stats.totalDonations / 100) * 100)}%` }}
                            />
                          </div>
                          <div className="text-sm font-semibold min-w-20 text-right">
                            ${(amount / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Donations */}
            <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Users className="w-5 h-5" />
                   {t("Quyên góp gần đây", lang)}
                 </CardTitle>
               </CardHeader>
              <CardContent>
                {donations.filter(d => d.status === "completed").length === 0 ? (
                  <div className="text-center py-8 text-slate-600">
                    {t("Chưa có quyên góp nào", lang)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                         <tr className="border-b">
                           <th className="text-left py-2 px-3 font-semibold">{t("Ngày", lang)}</th>
                           <th className="text-left py-2 px-3 font-semibold">{t("Người quyên góp", lang)}</th>
                           <th className="text-left py-2 px-3 font-semibold">{t("Loại", lang)}</th>
                           <th className="text-right py-2 px-3 font-semibold">{t("Số tiền", lang)}</th>
                         </tr>
                       </thead>
                      <tbody>
                        {donations
                          .filter(d => d.status === "completed")
                          .slice(0, 20)
                          .map(d => (
                            <tr key={d.id} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-3">
                                {format(new Date(d.created_date), "dd/MM/yyyy HH:mm")}
                              </td>
                              <td className="py-3 px-3">
                                {d.is_anonymous ? (
                                  <span className="text-slate-500 italic">{t("Ẩn danh", lang)}</span>
                                ) : (
                                  d.donor_name || d.donor_email
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                                  {d.category?.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-semibold text-red-600">
                                ${(d.amount / 100).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}